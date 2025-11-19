import sqlite3
import json
import base64
import os
from typing import List, Dict, Optional, Tuple

DB_PATH = os.path.join(os.path.dirname(__file__), 'face_ai.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            name TEXT PRIMARY KEY,
            deep_vec TEXT NOT NULL,
            clip_vec TEXT,
            thumbnail BLOB
        )
    ''')
    conn.commit()
    conn.close()

# Auto-init on import
init_db()

def save_user_embedding(name: str, deep_vec_list: List[float], clip_vec_list: List[float], thumbnail_bytes: bytes):
    conn = get_db_connection()
    conn.execute('''
        INSERT OR REPLACE INTO users (name, deep_vec, clip_vec, thumbnail)
        VALUES (?, ?, ?, ?)
    ''', (name, json.dumps(deep_vec_list), json.dumps(clip_vec_list), thumbnail_bytes))
    conn.commit()
    conn.close()

def get_all_users() -> List[Dict]:
    conn = get_db_connection()
    rows = conn.execute('SELECT name, deep_vec, clip_vec, thumbnail FROM users').fetchall()
    conn.close()
    
    users = []
    for row in rows:
        thumbnail_b64 = ""
        if row['thumbnail']:
            thumbnail_b64 = "data:image/jpeg;base64," + base64.b64encode(row['thumbnail']).decode('utf-8')
            
        users.append({
            'name': row['name'],
            'deep': json.loads(row['deep_vec']),
            'clip': json.loads(row['clip_vec']) if row['clip_vec'] else [],
            'thumbnail': thumbnail_b64
        })
    return users

def get_users() -> Dict[str, Dict]:
    conn = get_db_connection()
    rows = conn.execute('SELECT name, deep_vec, clip_vec FROM users').fetchall()
    conn.close()
    
    users = {}
    for row in rows:
        users[row['name']] = {
            'deep': json.loads(row['deep_vec']),
            'clip': json.loads(row['clip_vec']) if row['clip_vec'] else []
        }
    return users

def delete_user(name: str):
    conn = get_db_connection()
    conn.execute('DELETE FROM users WHERE name = ?', (name,))
    conn.commit()
    conn.close()

def get_thumbnail(name: str) -> Optional[bytes]:
    conn = get_db_connection()
    row = conn.execute('SELECT thumbnail FROM users WHERE name = ?', (name,)).fetchone()
    conn.close()
    if row:
        return row['thumbnail']
    return None

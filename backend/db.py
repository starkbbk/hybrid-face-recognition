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
            thumbnail BLOB,
            allowed_start TEXT DEFAULT '00:00',
            allowed_end TEXT DEFAULT '23:59'
        )
    ''')
    
    # Migration for existing tables
    try:
        conn.execute('ALTER TABLE users ADD COLUMN allowed_start TEXT DEFAULT "00:00"')
        conn.execute('ALTER TABLE users ADD COLUMN allowed_end TEXT DEFAULT "23:59"')
    except sqlite3.OperationalError:
        pass # Columns likely exist
        
    conn.commit()
    conn.close()

# Auto-init on import
init_db()

def save_user_embedding(name: str, deep_vec_list: List[float], clip_vec_list: List[float], thumbnail_bytes: bytes):
    conn = get_db_connection()
    # Check if user exists to preserve existing access rules
    existing = conn.execute('SELECT allowed_start, allowed_end FROM users WHERE name = ?', (name,)).fetchone()
    start, end = ("00:00", "23:59")
    if existing:
        start, end = existing['allowed_start'], existing['allowed_end']

    conn.execute('''
        INSERT OR REPLACE INTO users (name, deep_vec, clip_vec, thumbnail, allowed_start, allowed_end)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (name, json.dumps(deep_vec_list), json.dumps(clip_vec_list), thumbnail_bytes, start, end))
    conn.commit()
    conn.close()

def get_all_users() -> List[Dict]:
    conn = get_db_connection()
    rows = conn.execute('SELECT name, deep_vec, clip_vec, thumbnail, allowed_start, allowed_end FROM users').fetchall()
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
            'thumbnail': thumbnail_b64,
            'allowed_start': row['allowed_start'] or "00:00",
            'allowed_end': row['allowed_end'] or "23:59"
        })
    return users

def get_users() -> Dict[str, Dict]:
    conn = get_db_connection()
    rows = conn.execute('SELECT name, deep_vec, clip_vec, allowed_start, allowed_end FROM users').fetchall()
    conn.close()
    
    users = {}
    for row in rows:
        users[row['name']] = {
            'deep': json.loads(row['deep_vec']),
            'clip': json.loads(row['clip_vec']) if row['clip_vec'] else [],
            'allowed_start': row['allowed_start'] or "00:00",
            'allowed_end': row['allowed_end'] or "23:59"
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

def rename_user(old_name: str, new_name: str) -> bool:
    conn = get_db_connection()
    try:
        conn.execute('UPDATE users SET name = ? WHERE name = ?', (new_name, old_name))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def update_access_rules(name: str, start: str, end: str) -> bool:
    conn = get_db_connection()
    try:
        conn.execute('UPDATE users SET allowed_start = ?, allowed_end = ? WHERE name = ?', (start, end, name))
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()

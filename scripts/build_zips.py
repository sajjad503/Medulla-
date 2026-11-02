import os
import zipfile
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def create_php_edition_zip():
    zip_path = os.path.join(ROOT_DIR, "medulla-php-edition.zip")
    print(f"📦 Creating PHP Edition zip: {zip_path}")
    
    ignore_dirs = {'node_modules', '.git', '.aistudio', 'build', 'dist', 'legacy-python-backend', 'backend', '__pycache__'}
    ignore_files = {'medulla-php-edition.zip', 'medulla-python-legacy.zip', 'package-lock.json', 'bun.lock'}
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add primary PHP and React files
        for root, dirs, files in os.walk(ROOT_DIR):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                if file in ignore_files or file.endswith('.pyc'):
                    continue
                # Skip python files outside scripts
                if file in ('main.py', 'requirements.txt') and root == ROOT_DIR:
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ROOT_DIR)
                zipf.write(full_path, arcname=rel_path)
                
    print(f"✅ Created {zip_path} ({os.path.getsize(zip_path) / (1024*1024):.2f} MB)")

def create_python_legacy_zip():
    zip_path = os.path.join(ROOT_DIR, "medulla-python-legacy.zip")
    print(f"📦 Creating Python Legacy zip: {zip_path}")
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        legacy_dir = os.path.join(ROOT_DIR, "legacy-python-backend")
        if os.path.exists(legacy_dir):
            for root, dirs, files in os.walk(legacy_dir):
                dirs[:] = [d for d in dirs if d != '__pycache__']
                for file in files:
                    if file.endswith('.pyc'): continue
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, legacy_dir)
                    zipf.write(full_path, arcname=os.path.join("legacy-python-backend", rel_path))
                    
        # Add root python files if relevant
        for f in ['requirements.txt', 'Procfile', 'liara.json']:
            fp = os.path.join(ROOT_DIR, f)
            if os.path.exists(fp):
                zipf.write(fp, arcname=f)
                
    print(f"✅ Created {zip_path} ({os.path.getsize(zip_path) / 1024:.2f} KB)")

if __name__ == "__main__":
    create_php_edition_zip()
    create_python_legacy_zip()
    print("🎉 Both standalone editions packaged successfully!")

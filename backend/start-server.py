from pathlib import Path
import os

os.chdir('/d/project/python/ticketing-system/backend')

try:
    from os import path
    result_venv = path.abspath('.venv')
except:
    print("No venv!", file=sys.stderr)
    sys.exit(1)

sys.path.insert(0, 'D:/project/python/ticketing-system/backend/src')
os.environ['VIRTUAL_ENV'] = result_venv

result = subprocess.run(
    ["python", "-c", """
import os
print("Starting Django server on 8000", file=sys.stderr)
django_mode = sys.argv[1] if len(sys.argv) > 1 else 'default'
execute_from_command_line(['runserver', '0.0.0.0:8000'])
"""] + sys.argv, capture_output=True, text=True, timeout=30)

print("Exit code:", result.returncode, file=sys.stderr)

if result.stdout:
    print("\nSTDOUT:\n", result.stdout)
    print()

if result.stderr:
    print("\nSTDERR (first 500 lines):\n", result.stderr[:500])
    print()

sys.exit(result.returncode)

#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
```

Then run once: `git update-index --chmod=+x backend/build.sh`

### 1E. CREATE `backend/runtime.txt` (new file)
```
python-3.12.3
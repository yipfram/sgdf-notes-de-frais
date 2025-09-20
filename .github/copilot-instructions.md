# SGDF Notes de Frais - Developer Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Repository Overview
This is currently a minimal mock repository for testing purposes. It contains only basic documentation and serves as a foundation for future development.

## Working Effectively

### Initial Repository Setup and Exploration
- **Always start by exploring the repository structure:**
  - `cd /home/runner/work/sgdf-notes-de-frais/sgdf-notes-de-frais`
  - `ls -la` to see all files including hidden ones
  - `find . -type f | grep -v "\.git/" | sort` to list all non-git files
  - `cat README.md` to understand the repository purpose

### Current State Validation
- **Verify repository contents:**
  - Run `ls -la` - you should see: `.git/`, `README.md`, and `.github/` directories
  - Run `cat README.md` - should show this is a mock repository for testing purposes
  - **IMPORTANT**: There are currently NO build files, source code, tests, or dependencies

### When Adding New Code or Features
- **Always validate the repository state first** by running the exploration commands above
- **Before making any changes:**
  - Check if package.json, Makefile, or other build files have been added
  - Look for new source code directories (src/, lib/, app/, etc.)
  - Search for configuration files (.gitignore, .env files, etc.)
  - Check for new scripts or build files

### Build and Test Validation (For Future Development)
- **When build files are added, always validate:**
  - If `package.json` exists: run `npm install` (may take 5-10 minutes)
  - If `Makefile` exists: run `make` or `make build`
  - If `requirements.txt` exists: run `pip install -r requirements.txt`
  - **NEVER CANCEL builds** - they may take 30+ minutes. Set timeout to 60+ minutes minimum
  - **NEVER CANCEL tests** - they may take 15+ minutes. Set timeout to 30+ minutes minimum

### Testing Protocol (When Tests Are Added)
- **Search for test files and commands:**
  - Look for `test/`, `tests/`, `__tests__/` directories
  - Check for test scripts in package.json (`npm test`, `npm run test`)
  - Look for test files: `*.test.js`, `*.spec.js`, `*_test.py`, etc.
  - **Always run the full test suite** before making changes
  - **CRITICAL**: Wait for ALL tests to complete - NEVER CANCEL

### Validation Requirements
- **Manual validation is required for any changes:**
  - After adding any functionality, test it manually
  - If a web application is added, start it and verify it loads
  - If a CLI tool is added, run `--help` and test basic commands
  - If APIs are added, test endpoints manually
  - **Take screenshots** of any UI changes for verification

### Linting and Code Quality (When Tooling Is Added)
- **Always check for and run linting tools:**
  - If `.eslintrc*` exists: run `npm run lint` or `npx eslint .`
  - If `pyproject.toml` or `setup.cfg` exists: run `flake8` or `black`
  - If `Dockerfile` exists: run `docker build .` to validate
  - **Always run linting before committing** or CI will fail

## Common Repository Patterns to Watch For

### Node.js Projects
- Look for: `package.json`, `node_modules/`, `npm-shrinkwrap.json`
- Build: `npm install && npm run build` (NEVER CANCEL - may take 45+ minutes)
- Test: `npm test` (NEVER CANCEL - may take 15+ minutes)
- Run: `npm start` or `npm run dev`
- Lint: `npm run lint`

### Python Projects
- Look for: `requirements.txt`, `setup.py`, `pyproject.toml`, `Pipfile`
- Build: `pip install -r requirements.txt`
- Test: `python -m pytest` or `python -m unittest`
- Run: `python main.py` or check setup.py for entry points
- Lint: `flake8` or `black --check`

### Docker Projects
- Look for: `Dockerfile`, `docker-compose.yml`
- Build: `docker build -t sgdf-notes .` (NEVER CANCEL - may take 30+ minutes)
- Run: `docker run sgdf-notes` or `docker-compose up`
- Test: Look for docker-compose test services

### CI/CD Workflows
- Check `.github/workflows/` for GitHub Actions
- Look for `Jenkinsfile`, `.travis.yml`, `.gitlab-ci.yml`
- **Always run the same commands locally** that CI runs

## Timeout Guidelines
- **Build commands**: Always set timeout to 60+ minutes minimum
- **Test commands**: Always set timeout to 30+ minutes minimum
- **Install commands**: Set timeout to 20+ minutes minimum
- **Lint commands**: Usually fast, but set timeout to 10+ minutes to be safe
- **CRITICAL**: NEVER CANCEL long-running operations

## Key Locations in Repository (Current)
```
/home/runner/work/sgdf-notes-de-frais/sgdf-notes-de-frais/
├── .git/                  # Git repository data
├── .github/               # GitHub configuration (this file)
│   └── copilot-instructions.md
└── README.md              # Basic repository documentation
```

## Common Commands Reference
These commands work in the current repository state:

### Repository Exploration
```bash
# Navigate to repository root
cd /home/runner/work/sgdf-notes-de-frais/sgdf-notes-de-frais

# List all files
ls -la

# Find all non-git files
find . -type f | grep -v "\.git/" | sort

# Check for hidden files
find . -name ".*" -type f | grep -v ".git"

# View repository structure
tree . 2>/dev/null || find . -type d | grep -v .git | sort
```

### File Operations
```bash
# Read the README
cat README.md

# Check Git status
git status

# View recent commits
git log --oneline -10
```

### Search for Development Files
```bash
# Look for build files
find . -name "package.json" -o -name "Makefile" -o -name "setup.py" -o -name "requirements.txt" -o -name "Dockerfile"

# Look for source code
find . -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.java" -o -name "*.cpp" | head -10

# Look for test files
find . -name "*test*" -o -name "*spec*" | head -10

# Look for configuration files
find . -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.toml" | head -10
```

## Emergency Procedures
- **If builds fail**: Check for missing dependencies, wrong Node.js version, or platform-specific issues
- **If tests fail**: Run tests individually to isolate failures, check for missing test data
- **If commands hang**: Wait at least 60 minutes before considering alternatives
- **If repository seems broken**: Run `git status` and `git diff` to understand changes

## Future Development Notes
When this repository evolves beyond its current mock state:
1. **Update these instructions** with specific build, test, and run commands
2. **Document exact timing** for all operations with measured times plus 50% buffer
3. **Add specific validation scenarios** that must be tested manually
4. **Include any environment setup** required for development
5. **Document any known issues or workarounds**

Remember: This repository currently has NO executable code, NO build process, and NO tests. These instructions provide a framework for when such elements are added.
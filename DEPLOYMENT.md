# Moor Digital Marketing — Deployment Guide

## How It Works

Every time you push changes to the `main` branch on GitHub, a GitHub Action
automatically syncs the site files to your Hostinger VPS via SSH + rsync.
The live site updates within ~30 seconds of pushing.

---

## One-Time Setup (15 minutes)

### 1. Create a Private GitHub Repo

1. Go to https://github.com/new
2. Name it `moordm-website` (or whatever you prefer)
3. Set visibility to **Private**
4. Do NOT add a README or .gitignore (we already have them)
5. Click **Create repository**

### 2. Generate an SSH Key Pair for Deployment

On your local machine (or in any terminal):

```bash
ssh-keygen -t ed25519 -C "deploy@moordm" -f ~/.ssh/moordm_deploy -N ""
```

This creates two files:
- `~/.ssh/moordm_deploy` (private key — goes into GitHub Secrets)
- `~/.ssh/moordm_deploy.pub` (public key — goes on your VPS)

### 3. Add the Public Key to Your VPS

SSH into your Hostinger VPS and add the public key:

```bash
ssh root@YOUR_VPS_IP

# Then on the VPS:
mkdir -p ~/.ssh
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Replace `PASTE_YOUR_PUBLIC_KEY_HERE` with the contents of `~/.ssh/moordm_deploy.pub`.

### 4. Add Secrets to GitHub

In your GitHub repo, go to **Settings → Secrets and variables → Actions**
and add these 5 repository secrets:

| Secret Name        | Value                                                      |
|--------------------|-------------------------------------------------------------|
| `REMOTE_HOST`      | Your VPS IP address (e.g. `154.41.xxx.xxx`)                |
| `REMOTE_PORT`      | SSH port (usually `22`)                                     |
| `REMOTE_USER`      | SSH username (usually `root` on Hostinger VPS)             |
| `REMOTE_PATH`      | Path to your web root (e.g. `/home/moordm.com/public_html/`) |
| `SSH_PRIVATE_KEY`  | Full contents of `~/.ssh/moordm_deploy` (the PRIVATE key) |

**Important:** `REMOTE_PATH` must end with a trailing slash `/`.

### 5. Push the Code

From this folder on your machine:

```bash
git remote add origin git@github.com:YOUR_USERNAME/moordm-website.git
git push -u origin main
```

The GitHub Action will trigger automatically and deploy to your VPS.

---

## Day-to-Day Workflow

### When changes are made (e.g. by Claude in Cowork mode):

```bash
cd "path/to/MoorDM Website"
git add -A
git commit -m "Describe the changes"
git push
```

That's it — the Action deploys automatically.

### Manual deploy from GitHub UI:

1. Go to your repo on GitHub
2. Click **Actions** tab
3. Select **Deploy to Hostinger VPS**
4. Click **Run workflow**

---

## Before Going Live — WordPress Backup

Since this replaces your WordPress site, back it up first:

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Back up the entire public_html
cp -r /home/moordm.com/public_html /home/moordm.com/public_html_wp_backup

# Back up the WordPress database
mysqldump -u DB_USER -p DB_NAME > /home/moordm.com/wp_database_backup.sql
```

This gives you a full rollback option if needed.

---

## SSL / HTTPS

Hostinger VPS likely already has an SSL certificate for moordm.com via your
WordPress setup. The static site will use the same certificate — no changes
needed. If SSL needs renewing, use Hostinger's hPanel or run:

```bash
certbot renew
```

---

## Custom Domain Note

If you want the site on `moordigitalmarketing.com` instead of or in addition
to `moordm.com`, update the `REMOTE_PATH` secret to point to that domain's
web root, and set up DNS A records pointing to your VPS IP.

---

## Troubleshooting

**Action fails with "Permission denied":**
- Check that the public key is in `~/.ssh/authorized_keys` on the VPS
- Check that `REMOTE_USER` matches the SSH user on the VPS
- Make sure the private key in GitHub Secrets has no extra whitespace

**Site shows old WordPress content:**
- Verify `REMOTE_PATH` points to the correct `public_html` directory
- Check the Action logs in GitHub → Actions tab for errors
- Clear your browser cache or try incognito

**404 errors on pages:**
- Make sure `.htaccess` isn't being deleted (it's excluded from rsync)
- If you need a custom `.htaccess`, create one and remove it from the rsync exclusions

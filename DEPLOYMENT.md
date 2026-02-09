# SVG.Best Deployment Guide

## Production Deployment on Vultr

### Current Setup
- **Server**: Vultr VPS (45.76.37.161)
- **Node.js**: v23.0.0 (causes TypeScript issues)
- **Database**: PostgreSQL
- **Process Manager**: PM2
- **Web Server**: nginx with SSL (Let's Encrypt)
- **Domain**: https://svg.best

### Node.js v23 TypeScript Issues

**Problem**: Node.js v23 has stricter ES module handling that conflicts with our TypeScript seed files.

**Error symptoms**:
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"
ReferenceError: exports is not defined in ES module scope
```

**Current Workaround** (located in `/var/www/svg-best/server/`):
```bash
# Normal seeding FAILS:
npx prisma db seed

# Workaround - compile TypeScript manually:
npx tsc prisma/seed.ts prisma/seeds/system/systemIcons.ts prisma/seeds/system/generatedIcons.ts --outDir ./temp --target es2020 --module commonjs --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck

# Rename compiled files to .cjs (required for Node.js v23):
mv temp/seed.js temp/seed.cjs
mv temp/seeds/system/systemIcons.js temp/seeds/system/systemIcons.cjs
mv temp/seeds/system/generatedIcons.js temp/seeds/system/generatedIcons.cjs

# Update import paths in seed.cjs:
sed -i 's/\.\/seeds\/system\/systemIcons/\.\/seeds\/system\/systemIcons.cjs/g' temp/seed.cjs
sed -i 's/\.\/seeds\/system\/generatedIcons/\.\/seeds\/system\/generatedIcons.cjs/g' temp/seed.cjs

# Run the compiled seed:
node temp/seed.cjs
```

**Better Solution**: Downgrade to Node.js 18 LTS to avoid these issues entirely.

### Deployment Process

1. **SSH to VPS**:
   ```bash
   ssh root@45.76.37.161
   cd /var/www/svg-best
   ```

2. **Update code**:
   ```bash
   git pull origin main
   ```

3. **Update dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. **Run migrations** (if schema changed):
   ```bash
   cd ../server
   npx prisma migrate deploy
   ```

5. **Seed database** (if needed):
   ```bash
   # Use the TypeScript workaround above
   ```

6. **Build client**:
   ```bash
   cd ../client
   npm run build
   ```

7. **Restart server**:
   ```bash
   cd ../server
   pm2 restart svg-best-server
   ```

8. **Reload nginx** (if config changed):
   ```bash
   systemctl reload nginx
   ```

### Important Files on VPS

- **Project**: `/var/www/svg-best/`
- **nginx config**: `/etc/nginx/sites-available/svg.best`
- **SSL certificates**: `/etc/letsencrypt/live/svg.best/`
- **Environment file**: `/var/www/svg-best/server/.env`
- **Compiled seeds**: `/var/www/svg-best/server/temp/` (temp files for Node.js v23 workaround)

### Environment Variables

The `.env` file contains:
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://svgbestuser:PASSWORD@localhost:5432/svgbest?schema=public
```

### Process Management

- **Check status**: `pm2 status`
- **View logs**: `pm2 logs svg-best-server`
- **Restart**: `pm2 restart svg-best-server`
- **Stop**: `pm2 stop svg-best-server`

#### Auto-start on boot

PM2 is configured to auto-start on VPS reboot via `pm2 save` and `pm2 startup`. If you ever re-register the process (e.g. after deleting and re-adding it), run these again:

```bash
pm2 save       # Saves current process list
pm2 startup    # Run the command it outputs to enable auto-start on boot
```

**Note**: The Feb 2026 outage was caused by a VPS reboot before auto-start was configured — PM2 came up with an empty process list, so the backend wasn't running and nginx returned 502.

### Database Access

```bash
# Connect as postgres user
sudo -u postgres psql -d svgbest

# Connect as app user
psql -U svgbestuser -d svgbest -h localhost
```

### SSL Certificate Renewal

Certificates auto-renew via cron. To manually renew:
```bash
certbot renew --dry-run
```

### Troubleshooting

1. **502 Bad Gateway**: Check `pm2 status` — the backend is likely not running. See "Auto-start on boot" above.
2. **TypeScript seed issues**: Use the manual compilation workaround above
3. **Database permissions**: User `svgbestuser` should own the `svgbest` database
4. **nginx not serving**: Check if site is enabled in `/etc/nginx/sites-enabled/`
5. **PM2 not starting**: Check if server code compiles with `node src/server.js`

### Recommended Improvements

1. **Downgrade to Node.js 18 LTS** for better TypeScript compatibility
2. **Add deployment script** to automate the manual steps
3. **Set up GitHub Actions** for automated deployments
4. **Add monitoring** for uptime and errors
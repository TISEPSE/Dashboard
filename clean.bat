@echo off
echo Nettoyage du projet Dashboard...

if exist android rmdir /s /q android
if exist capacitor.config.ts del capacitor.config.ts
if exist fix-prisma.js del fix-prisma.js
if exist init-db.js del init-db.js
if exist lib rmdir /s /q lib
if exist prisma rmdir /s /q prisma
if exist setup-db.ps1 del setup-db.ps1
if exist setup-neon.js del setup-neon.js
if exist test-auth.js del test-auth.js
if exist test-calendar.html del test-calendar.html

if exist src\app\services\localCalendar.js del src\app\services\localCalendar.js
if exist src\app\hook rmdir /s /q src\app\hook
if exist src\app\contexts rmdir /s /q src\app\contexts

if exist scripts\migrate-to-postgres.js del scripts\migrate-to-postgres.js
if exist scripts\clean-dev.sh del scripts\clean-dev.sh
if exist scripts\dev-watcher.sh del scripts\dev-watcher.sh

echo Nettoyage terminé !
pause
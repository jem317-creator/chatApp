# call this script when you want to push to production
rm -r scr/server/dist
npm run build
cp -r dist src/server && rm -r dist
python src/server/Server.py
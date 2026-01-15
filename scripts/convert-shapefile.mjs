import shp from 'shpjs';
import fs from 'fs';

async function convert() {
    try {
        const buffer = fs.readFileSync('public/aimag.zip');
        const geojson = await shp(buffer);
        fs.writeFileSync('public/aimag.geojson', JSON.stringify(geojson));
        console.log('Successfully converted aimag.zip to aimag.geojson');
    } catch (e) {
        console.error('Conversion failed:', e);
    }
}

convert();

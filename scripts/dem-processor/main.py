# /// script
# dependencies = ["rasterio", "numpy"]
# ///
import rasterio
import numpy as np

def dem_to_rgb(input_path, output_path):
    with rasterio.open(input_path) as src:
        # 1. Prepare Metadata for 3-band RGB output
        profile = src.profile.copy()
        
        # FIX: Remove the 32767 nodata value that causes the crash
        profile.pop('nodata', None) 
        
        profile.update(
            dtype=rasterio.uint8,
            count=3,
            compress='lzw',
            tiled=True,
            blockxsize=256,
            blockysize=256,
            nodata=None  # Explicitly set output nodata to None
        )

        with rasterio.open(output_path, 'w', **profile) as dst:
            for _, window in src.block_windows(1):
                # Read 1-band elevation data
                data = src.read(1, window=window).astype(np.float32)

                # FIX: Handle ASTER "voids" (nodata) by setting them to 0m
                if src.nodata is not None:
                    data[data == src.nodata] = 0

                # 2. Terrain-RGB Encoding Formula (precision = 0.1m)
                # height = -10000 + ((R * 256^2 + G * 256 + B) * 0.1)
                val = (data + 10000) * 10
                
                # Split into RGB channels
                r = (val // 65536).astype(np.uint8)
                g = ((val // 256) % 256).astype(np.uint8)
                b = (val % 256).astype(np.uint8)

                # Write to the 3 output bands
                dst.write(r, 1, window=window)
                dst.write(g, 2, window=window)
                dst.write(b, 3, window=window)
                
                print(f"Processed block: {window}")

if __name__ == "__main__":
    dem_to_rgb("dem_files/Mongolia_ASTER_DEM.tif", "dem_files/terrain_rgb.tif")

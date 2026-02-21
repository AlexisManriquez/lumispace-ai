import os
import requests
import json

textures = [
    "wood_floor", "diagonal_parquet", "rectangular_parquet", "plank_flooring",
    "plank_flooring_02", "laminate_floor", "laminate_floor_02", "laminate_floor_03",
    "dark_wooden_planks", "wood_planks", "old_wood_floor", "marble_01",
    "stone_tiles", "tiled_floor_001", "square_tiles", "floor_tiles_02",
    "floor_tiles_04", "floor_tiles_06", "floor_tiles_08"
]

base_dir = r"c:\Users\Alexis Manriquez\Documents\LumiSpace\lumispace-poc\public\textures"

def download_file(url, dest):
    if not url:
        return
    print(f"Downloading {url} to {dest}...")
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            with open(dest, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
        else:
            print(f"Failed to download {url}: {response.status_code}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

def main():
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    for tex_id in textures:
        print(f"\nProcessing texture: {tex_id}")
        api_url = f"https://api.polyhaven.com/files/{tex_id}"
        try:
            res = requests.get(api_url)
            if res.status_code != 200:
                print(f"Could not fetch metadata for {tex_id}")
                continue
            
            data = res.json()
            tex_path = os.path.join(base_dir, tex_id)
            if not os.path.exists(tex_path):
                os.makedirs(tex_path)

            maps = {
                "Diffuse": "diff.jpg",
                "nor_gl": "nor.jpg",
                "Rough": "rough.jpg",
                "AO": "ao.jpg"
            }

            for map_key, filename in maps.items():
                try:
                    # Navigation: data[map_key]['1k']['jpg']['url']
                    url = data.get(map_key, {}).get('1k', {}).get('jpg', {}).get('url')
                    if url:
                        download_file(url, os.path.join(tex_path, filename))
                    else:
                        print(f"Map {map_key} not found for {tex_id} in 1k jpg")
                except Exception as e:
                    print(f"Error extracting {map_key} for {tex_id}: {e}")

        except Exception as e:
            print(f"Error processing {tex_id}: {e}")

if __name__ == "__main__":
    main()

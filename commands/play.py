import yt_dlp
import sys
import json

def fetch_audio_url(video_url):
    ydl_opts = {
        'format': 'bestaudio[ext=webm]/bestaudio',  # Prefer WebM for better streaming
        'noplaylist': True,  # Ensure only one video is processed
        'quiet': True,  # Suppress logs
        'cookiefile': '/cookies.txt',  # Optional: Use cookies if needed
        'nocheckcertificate': True,  # Prevent SSL errors
        'source_address': '0.0.0.0',  # Force IPv4 for better stability
        'geo_bypass': True,  # Bypass region locks
        'force_generic_extractor': True  # Ensure a direct URL is fetched
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            audio_url = info.get('url')
            if audio_url:
                print(json.dumps({'audio_url': audio_url}))
            else:
                print(json.dumps({'error': 'No audio URL found'}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))

if __name__ == "__main__":
    video_url = sys.argv[1]
    fetch_audio_url(video_url)

import tkinter as tk
from tkinter import ttk, messagebox
import requests
from bs4 import BeautifulSoup
import os
import urllib.parse
from urllib.request import urlretrieve
import re
from datetime import datetime

class ImageScraperGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Web Image Scraper")
        self.root.configure(bg='#232323')
        
        # Set window size and position
        window_width = 600
        window_height = 400
        screen_width = root.winfo_screenwidth()
        screen_height = root.winfo_screenheight()
        x = (screen_width - window_width) // 2
        y = (screen_height - window_height) // 2
        self.root.geometry(f'{window_width}x{window_height}+{x}+{y}')

        # Style configuration
        style = ttk.Style()
        style.configure('Custom.TLabel', background='#232323', foreground='#e0e0e0')
        style.configure('Custom.TEntry', fieldbackground='#171717', foreground='#e0e0e0')
        style.configure('Custom.TButton', background='#f47725', foreground='#232323')

        # Create main frame
        self.main_frame = ttk.Frame(root, padding="20")
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # URL Entry
        self.url_label = ttk.Label(self.main_frame, text="Enter Website URL:", style='Custom.TLabel')
        self.url_label.pack(pady=(0, 5))
        
        self.url_entry = ttk.Entry(self.main_frame, width=50, style='Custom.TEntry')
        self.url_entry.pack(pady=(0, 20))

        # Scrape Button
        self.scrape_button = ttk.Button(
            self.main_frame,
            text="Scrape Images",
            command=self.scrape_images,
            style='Custom.TButton'
        )
        self.scrape_button.pack(pady=(0, 20))

        # Status Text
        self.status_text = tk.Text(self.main_frame, height=10, bg='#171717', fg='#e0e0e0')
        self.status_text.pack(fill=tk.BOTH, expand=True)

    def scrape_images(self):
        url = self.url_entry.get().strip()
        if not url:
            messagebox.showerror("Error", "Please enter a URL")
            return

        try:
            # Create timestamp folder
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            save_dir = os.path.join("Developer Tools", "DevImages", timestamp)
            os.makedirs(save_dir, exist_ok=True)

            # Fetch and parse the webpage
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')

            # Find all image tags
            images = soup.find_all('img')
            self.status_text.delete(1.0, tk.END)
            self.status_text.insert(tk.END, f"Found {len(images)} images\n")

            # Download images
            downloaded = 0
            for i, img in enumerate(images):
                try:
                    img_url = img.get('src')
                    if not img_url:
                        continue

                    # Handle relative URLs
                    if not img_url.startswith(('http://', 'https://')):
                        img_url = urllib.parse.urljoin(url, img_url)

                    # Generate filename
                    file_name = f"image_{i+1}{os.path.splitext(img_url)[1]}"
                    if not file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                        file_name += '.jpg'

                    # Download the image
                    file_path = os.path.join(save_dir, file_name)
                    urlretrieve(img_url, file_path)
                    downloaded += 1
                    
                    self.status_text.insert(tk.END, f"Downloaded: {file_name}\n")
                    self.status_text.see(tk.END)
                    self.root.update()

                except Exception as e:
                    self.status_text.insert(tk.END, f"Error downloading image: {str(e)}\n")

            self.status_text.insert(tk.END, f"\nCompleted! Downloaded {downloaded} images to {save_dir}")

        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {str(e)}")

def main():
    root = tk.Tk()
    app = ImageScraperGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main() 
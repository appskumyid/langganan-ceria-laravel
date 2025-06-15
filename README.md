# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/fadef013-89a0-45ff-92bc-e2877a0c6e67

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fadef013-89a0-45ff-92bc-e2877a0c6e67) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Setup on a Debian Server

Berikut adalah panduan untuk menjalankan aplikasi ini di server Debian menggunakan Docker.

### Langkah 1: Instal Docker dan Docker Compose

Pertama, Anda perlu menginstal Docker Engine dan Docker Compose di server Anda.

```sh
# Update package list dan install dependensi
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Tambahkan GPG key resmi Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Langkah 2: Clone Repositori

Clone repositori proyek ini ke server Anda.

```sh
# Ganti <YOUR_GIT_URL> dengan URL Git repositori Anda
git clone <YOUR_GIT_URL>

# Masuk ke direktori proyek
cd <YOUR_PROJECT_NAME>
```

### Langkah 3: Konfigurasi Environment

Salin file `.env.example` menjadi `.env` dan sesuaikan isinya.

```sh
cp .env.example .env
```

Sekarang, buka file `.env` dengan editor teks favorit Anda (seperti `nano` atau `vim`) dan ubah nilai-nilai variabel, terutama `POSTGRES_PASSWORD` dan `JWT_SECRET` dengan nilai yang aman dan rahasia.

```sh
nano .env
```

### Langkah 4: Jalankan Aplikasi

Setelah konfigurasi selesai, jalankan aplikasi menggunakan Docker Compose.

```sh
# Build dan jalankan container di background
sudo docker compose up -d --build
```

Aplikasi Anda sekarang seharusnya berjalan. Anda dapat mengaksesnya melalui port yang telah dikonfigurasi (defaultnya adalah port 80 untuk aplikasi dan 8000 untuk Supabase Kong gateway).

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/fadef013-89a0-45ff-92bc-e2877a0c6e67) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# 🖥️ PrintFlow Standalone App Setup

To make PrintFlow feel like a professional, standalone desktop application, follow these steps to create a desktop shortcut with its own icon and isolated window.

---

### 1. The Launcher Files
I have already created the following files in your project directory:
*   `START_PROJECT.bat`: This handles starting the backend, frontend, and opening the "App Mode" window.
*   `PrintFlow.vbs`: A silent launcher that starts everything in the background (no black terminal windows).
*   `app_icon.png`: A premium custom icon for your application.

---

### 2. Create the Desktop Shortcut
1.  Go to your project folder: `d:\Work\Startup\Saraswathe_Graphix`.
2.  **Right-click** on `PrintFlow.vbs`.
3.  Select **Send to** > **Desktop (create shortcut)**.
4.  Go to your Desktop and find the new shortcut.

---

### 3. Customize the Shortcut
1.  **Right-click** the shortcut on your desktop and select **Properties**.
2.  Go to the **Shortcut** tab.
3.  Click **Change Icon...** (Ignore the warning about no icons).
4.  Click **Browse...** and navigate to your project folder.
5.  Select `app_icon.png` (You might need to change the file type dropdown to "All Files").
    *   *Note: Windows prefers `.ico` files. If `.png` doesn't work, you can quickly convert it using any online PNG-to-ICO converter.*
6.  Click **OK** and then **OK** again.
7.  **Rename** the shortcut to just **PrintFlow**.

---

### 4. How it Works
When you click the **PrintFlow** icon:
1.  **Silent Launch**: The VBScript starts the Python backend and Vite frontend in the background.
2.  **App Mode**: A dedicated browser window opens **without** address bars, tabs, or bookmarks. It looks and feels like a native Windows application.
3.  **Standalone**: You can move this window, pin it to your taskbar, and use it completely separately from your normal web browsing.

---

![PrintFlow Icon](file:///d:/Work/Startup/Saraswathe_Graphix/app_icon.png)
*Your custom premium app icon.*

# KN3AUX® Termux Widget Scripts

This directory contains utility scripts for integrating KN3AUX® functionality with Termux widgets on Android devices.

## KN3AUX Shizuku Shortcut Injector

### Overview
The `kn3aux_shizuku.sh` script provides modular shortcut integration for Termux Widget, designed for Crawfish-coded UIs and Cultural Dashboards.

### Installation

To install this script for use with Termux Widget:

```bash
# Create the Termux widget directory if it doesn't exist
mkdir -p ~/.termux/widget/dynamic_shortcuts/

# Copy the script to the Termux widget directory
cp scripts/termux-widgets/kn3aux_shizuku.sh ~/.termux/widget/dynamic_shortcuts/

# Make sure it's executable
chmod +x ~/.termux/widget/dynamic_shortcuts/kn3aux_shizuku.sh
```

### Usage

The script supports the following commands:

#### Launch KN3AUX ScriptDeck
```bash
./kn3aux_shizuku.sh scriptdeck
```
This launches the KN3AUX ScriptDeck application using Android intents.

#### Toggle Crawfish Overlay
```bash
./kn3aux_shizuku.sh overlay
```
This toggles the Crawfish overlay engine - kills it if running, starts it if not running.

#### Help
```bash
./kn3aux_shizuku.sh
```
Shows usage information for available commands.

### Features

- **Modular Design**: Easy to extend with additional shortcuts
- **KN3AUX® Branding**: Consistent with KN3AUX platform styling
- **Error Handling**: Proper case handling and usage instructions
- **Android Integration**: Uses Android Activity Manager for app launching
- **Process Management**: Smart toggle functionality for overlay services

### Requirements

- Android device with Termux installed
- Termux Widget app
- KN3AUX applications (for full functionality)
- Shell environment with `am` (Activity Manager) command available

### Extending the Script

To add new shortcuts, follow this pattern:

1. Add a new function:
```bash
my_new_function() {
  # Your command here
}
```

2. Add a case in the main execution block:
```bash
mynewcommand)
  my_new_function
  ;;
```

3. Update the usage message to include the new command.

---

**Built with ❤️ by KK | KN3AUX-CODE™**  
_"Empowering creators in a mobile-first world"_
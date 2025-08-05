#!/bin/bash

# Test script for kn3aux_shizuku.sh functionality
# This script validates the structure and behavior of the KN3AUX Shizuku shortcut injector

echo "Testing KN3AUX Shizuku Shortcut Injector..."
echo "============================================"

SCRIPT_PATH="./kn3aux_shizuku.sh"

if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ ERROR: Script not found at $SCRIPT_PATH"
    exit 1
fi

if [ ! -x "$SCRIPT_PATH" ]; then
    echo "❌ ERROR: Script is not executable"
    exit 1
fi

echo "✅ Script exists and is executable"

# Test help/usage output
echo ""
echo "Testing usage message:"
echo "----------------------"
usage_output=$(bash $SCRIPT_PATH 2>&1)
if [[ $usage_output == *"Usage: kn3aux_shizuku.sh {scriptdeck|overlay}"* ]]; then
    echo "✅ Usage message is correct"
else
    echo "❌ ERROR: Usage message is incorrect"
    echo "Got: $usage_output"
    exit 1
fi

# Test invalid command
echo ""
echo "Testing invalid command:"
echo "------------------------"
invalid_output=$(bash $SCRIPT_PATH invalid 2>&1)
if [[ $invalid_output == *"Usage: kn3aux_shizuku.sh {scriptdeck|overlay}"* ]]; then
    echo "✅ Invalid command handling is correct"
else
    echo "❌ ERROR: Invalid command handling is incorrect"
    exit 1
fi

# Test script structure
echo ""
echo "Testing script structure:"
echo "-------------------------"

# Check shebang
shebang=$(head -n1 "$SCRIPT_PATH")
if [[ $shebang == "#!/data/data/com.termux/files/usr/bin/bash" ]]; then
    echo "✅ Correct Termux shebang"
else
    echo "❌ ERROR: Incorrect shebang. Got: $shebang"
    exit 1
fi

# Check for KN3AUX branding
if grep -q "KN3AUX®" "$SCRIPT_PATH"; then
    echo "✅ KN3AUX® branding present"
else
    echo "❌ ERROR: KN3AUX® branding missing"
    exit 1
fi

# Check for required functions
if grep -q "launch_scriptdeck()" "$SCRIPT_PATH"; then
    echo "✅ launch_scriptdeck function present"
else
    echo "❌ ERROR: launch_scriptdeck function missing"
    exit 1
fi

if grep -q "toggle_overlay()" "$SCRIPT_PATH"; then
    echo "✅ toggle_overlay function present"
else
    echo "❌ ERROR: toggle_overlay function missing"
    exit 1
fi

# Check for case statement
if grep -q "case.*\$1.*in" "$SCRIPT_PATH"; then
    echo "✅ Case statement present"
else
    echo "❌ ERROR: Case statement missing"
    exit 1
fi

echo ""
echo "🎉 All tests passed! KN3AUX Shizuku shortcut injector is properly implemented."
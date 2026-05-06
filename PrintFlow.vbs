Set WshShell = CreateObject("WScript.Shell")

' Path to the project root
strPath = "d:\Work\Startup\Saraswathe_Graphix"
WshShell.CurrentDirectory = strPath

' Run the START_PROJECT.bat hidden
' 0 = Hidden window
' True = Wait for it to finish (we use False because the bat exits anyway after starting servers)
WshShell.Run "cmd /c START_PROJECT.bat", 0, False

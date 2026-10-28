' ==============================================================================
' SISAP by CENIVRA — Lanzador Silencioso para Windows
' Abre la aplicación de escritorio sin ventana negra de consola.
' ==============================================================================
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strScriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
exePath = strScriptDir & "\dist-desktop\SISAP_by_CENIVRA-win32-x64\SISAP_by_CENIVRA.exe"

If fso.FileExists(exePath) Then
    WshShell.CurrentDirectory = fso.GetParentFolderName(exePath)
    WshShell.Run Chr(34) & exePath & Chr(34), 1, False
Else
    WshShell.CurrentDirectory = strScriptDir
    WshShell.Run "cmd /c npm run desktop", 0, False
End If

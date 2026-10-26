Option Explicit
Dim shell, files, root, command, result
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
root = files.GetParentFolderName(WScript.ScriptFullName)
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & root & "\scripts\start-local.ps1"""
result = shell.Run(command, 0, True)
If result <> 0 Then
    MsgBox "Local server could not start. See output\local-server\startup.log", vbExclamation, "Local website"
End If

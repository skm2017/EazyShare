const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const shell = require('shelljs');
shell.config.execPath = path.join('C:', 'Program Files', 'nodejs', 'node.exe')

let mainWindow = null;

app.on('ready', () => {
    const htmlPath = path.join('src', 'index.html');

    mainWindow = new BrowserWindow({width: 400, height: 345, resizable: false, icon: path.join(__dirname, 'src/icon64x64.png')});
    mainWindow.setMenu(null);
    mainWindow.loadFile(htmlPath);
    mainWindow.on('closed', function () {
        shell.exec('netsh wlan stop hostednetwork');
        mainWindow = null
    })
});

ipcMain.on('hotspotCred', (event, theData) => {
    if (theData.ssidName && theData.ssidPwd) {
        shell.exec('netsh wlan set hostednetwork mode=allow ssid=' + theData.ssidName + ' key=' + theData.ssidPwd, {},
            function (code, stdout, stderr) {
                if (stderr) {
                    mainWindow.webContents.send('metadata:error', 'Error: hotspot creation failed.');
                } else {
                    shell.exec('netsh wlan start hostednetwork', {}, function (exitCode, stdOut, stdErr) {
                        if (stdErr) {
                            mainWindow.webContents.send('metadata:error', 'Error: hotspot creation failed.');
                        } else {
                            mainWindow.webContents.send('metadata', theData);
                        }
                    });
                }
            })
    } else {
        mainWindow.webContents.send('metadata:error', 'Error: hotspot creation failed.');
    }

});

ipcMain.on('disableHotspot', (event, theData) => {
    shell.exec('netsh wlan stop hostednetwork', {}, function (exitCode, stdOut, stdErr) {
        if (stdErr) {
            mainWindow.webContents.send('dData:error', 'Error: could not disable the hotspot.');
        } else {
            mainWindow.webContents.send('dData', theData);
        }
    });

});
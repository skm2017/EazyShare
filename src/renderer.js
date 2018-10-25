const { ipcRenderer } = require('electron');
let $ = require('jquery');
const shell = require('electron').shell;

$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

const submitListener = document
    .querySelector('form')
    .addEventListener('submit', (event) => {
        event.preventDefault();
        $('#submit').prop('disabled', true);
        let ssidName = $('#ssid').val();
        let ssidPwd = $('#pwd').val();
        if ($('#submit').hasClass('create-hotspot')) {
            ipcRenderer.send('hotspotCred', { ssidName: ssidName, ssidPwd: ssidPwd });
        } else {
            $("#submit").html('Create hotspot');
            ipcRenderer.send('disableHotspot', { ssidName: ssidName, ssidPwd: ssidPwd });
        }
    })

ipcRenderer.on('metadata', (evnt, mData) => {
    $('#message').html('Info: hotspot created with the following credentials:');
    $('#submit').prop('disabled', false).removeClass('create-hotspot').addClass('disable-hotspot').html('Disable hotspot');
    $('#ssid, #pwd').prop('readonly', true).css('border', '0');
})

ipcRenderer.on('metadata:error', (evnt, error) => {
    console.log('ERROR: ', error);
});

ipcRenderer.on('dData', (evnt, mData) => {
    $('#message').html('Info: hotspot disabled.');
    $('#submit').prop('disabled', false).removeClass('disable-hotspot').addClass('create-hotspot').html('Create hotspot');
    $('#ssid, #pwd').prop('readonly', false).val('').css('border', '1px solid #444');
})

ipcRenderer.on('dData:error', (evnt, error) => {
    console.log('ERROR: ', error);
});

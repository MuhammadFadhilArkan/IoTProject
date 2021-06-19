// Server and broker address
const brokerAddress = '192.168.43.51'
const serverAddress = '192.168.43.51'
const serverPort = 3000
var sum1=0; //Jumlah dari data-data yang diambil
var average1=0; //Rata-rata dari data-data yang diambil
var sum2=0;
var average2=0;
var sum3=0;
var average3 =0;
var p=0;
var q=0;
var r=0;
var ini;

//slider
var slider1 = document.getElementById("myRange1");
var output1 = document.getElementById("demo1");
var slider2 = document.getElementById("myRange2");
var output2 = document.getElementById("demo2");
var slider3 = document.getElementById("myRange3");
var output3 = document.getElementById("demo3");
var slider4 = document.getElementById("myRange4");
var output4 = document.getElementById("demo4");

output1.innerHTML = slider1.value; //Nilai dari slider1 (Red)
output2.innerHTML = slider2.value; //Nilai dari slider2 (Green)
output3.innerHTML = slider3.value; //Nilai dari slider3 (Blue)
output4.innerHTML = slider4.value; //Nilai dari slider4 (Limit)

//mengubah nilai slider berdasarkan input
slider1.oninput = function() {
  output1.innerHTML = this.value;
  client.publish("topic/myRange1",output1.innerHTML.toString(),{retain: true})
}
slider2.oninput = function() {
  output2.innerHTML = this.value;
  client.publish("topic/myRange2",output2.innerHTML.toString(),{retain: true})

}
slider3.oninput = function() {
  output3.innerHTML = this.value;
  client.publish("topic/myRange3",output3.innerHTML.toString(),{retain: true})
}
slider4.oninput = function() {
  output4.innerHTML = this.value;
  client.publish("topic/myRange4",output4.innerHTML.toString(),{retain: true})
}

// MQTT Setup
var client = mqtt.connect('ws:'+brokerAddress+':'+serverPort);

// Global Variable (LED)
var x1 = false;
var x2 = false;

// Run when connected (continuous)
client.on('connect', function() {
    client.subscribe('topic/sensor1')
    client.subscribe('topic/sensor2')
    client.subscribe('topic/sensor3')
    client.subscribe('topic/ledstatus1')
    client.subscribe('topic/manual')
    client.subscribe('topic/myRange1')
    client.subscribe('topic/myRange2')
    client.subscribe('topic/myRange3')
    client.subscribe('topic/myRange4')
    client.subscribe('topic/over')

    console.log('client connected at %s:%s',brokerAddress);
})

// Run when message received
//Mencetak pada console sesuai topik yang didapatkan
client.on('message', function(topic, message) {
    console.log('received message on %s: %s', topic, message)
    switch (topic) {
        case 'topic/sensor1': changeValue(message,"humidity_value"); break;
        case 'topic/sensor2': changeValue(message,"temperature_value"); break;
        case 'topic/sensor3': changeValue(message,"brightness_value"); break;
        case 'topic/ledstatus1' : changeLED(message,"ledstatus1"); break;
        case 'topic/manual' : changeLED(message,"manual"); break;
        case 'topic/over' : limit(message); break;

    }
})
//Memunculkan peringatan berdasarkan nilai Intensitas Cahaya dibandingkan dengan limit
function limit(cond){
  ini=cond.toString('utf-8');
  switch(ini) {
    case "T":document.getElementById("showthis").style.visibility="visible";break;
    case "F":document.getElementById("showthis").style.visibility="hidden";break;
    default:document.getElementById("showthis").style.visibility="hidden";break;
  }
}


//Mengubah nilai pada HTML berdasarkan data yang diterima termasuk chart, sekaligus mengubah nilai rata-rata menjadi yang baru
//Untuk temperatur, kelembapan, dan intensitas cahaya
function changeValue(value,value_id) {
    // Update HTML content
    document.getElementById(value_id).innerHTML = value

    // Update chart
    d = new Date()
    switch (value_id) {
        case 'humidity_value':
            gg1.value = value;
            document.getElementById("humidity_value").setAttribute("data-value", value);

            if (config[0].data.datasets[0].data.length > 299) {
              config[0].data.datasets[0].data.shift()
              config[0].data.labels.shift()
              p+=1;
            }
            sum1=0;
            for( var i = p ; i < config[0].data.datasets[0].data.length; i++ ){
                sum1 += parseInt( config[0].data.datasets[0].data[i], 10 );
            }
            average1= (sum1)/(config[0].data.datasets[0].data.length);
            document.getElementById("aver1").innerHTML = average1.toFixed(2);

            config[0].data.labels.push(d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()) // Current time as chart label
            config[0].data.datasets[0].data.push(value).toFixed(2)
            mychart1.update();
            break;
        case 'temperature_value':
              gg2.value = value;
              document.getElementById("temperature_value").setAttribute("data-value", value);

            if (config[1].data.datasets[0].data.length > 299) {
                config[1].data.datasets[0].data.shift()
                config[1].data.labels.shift()
                q+=1
            }
            sum2=0;
            for( var i = q; i < config[1].data.datasets[0].data.length; i++ ){
                sum2 += parseInt( config[1].data.datasets[0].data[i], 10 );
            }
            average2= (sum2)/(config[1].data.datasets[0].data.length);
            document.getElementById("aver2").innerHTML = average2.toFixed(2);

            config[1].data.labels.push(d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()) // Current time as chart label
            config[1].data.datasets[0].data.push(value).toFixed(2)
            mychart2.update();
            break;
        case 'brightness_value':
              gg3.value = value;
              document.getElementById("brightness_value").setAttribute("data-value", value);

            if (config[2].data.datasets[0].data.length > 299) {
                config[2].data.datasets[0].data.shift()
                config[2].data.labels.shift()
                r+=1
            }
            sum3=0;
            for( var i = r; i < config[2].data.datasets[0].data.length; i++ ){
                sum3 += parseInt( config[2].data.datasets[0].data[i], 10 );
            }
            average3= (sum3)/(config[2].data.datasets[0].data.length);
            document.getElementById("aver3").innerHTML = average3.toFixed(2);

            config[2].data.labels.push(d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()) // Current time as chart label
            config[2].data.datasets[0].data.push(value).toFixed(2)
            mychart3.update();
            break;
    }
}

//Mengubah kondisi LED digital berdasarkan inputan, secara otomatis maupun manual
function changeLED(state,led_id){ // Change LED on message received
    console.log('Received data LED for id %s : %s',led_id,state.toString('utf-8'));
    switch (led_id) {
        case 'ledstatus1':
            x1 = state.toString('utf-8');
            break;
        case 'manual':
            x2 = state.toString('utf-8');
            break;
        default:
            break;
    }
    switch (state.toString('utf-8')) {
        case 'false': // LED Mati
        document.getElementById(led_id.toString('utf-8')).style.backgroundColor = "#730505";
        break;
        case 'true': // LED Nyala
        document.getElementById(led_id.toString('utf-8')).style.backgroundColor = "rgb(46, 204, 113)";
        break;
        default: // Data Invalid
        document.getElementById(led_id.toString('utf-8')).style.backgroundColor = "white";
    }
}

// Perubahan keadaan LED digital melalui button, ketika manual on maupun off
function changeLEDButton() {
    console.log("Button clicked with id: %s",event.srcElement.id)
    var LEDid = event.srcElement.id.toString('utf-8')
    console.log("ledid: ", LEDid);

    switch (event.srcElement.id) {
        case 'ledstatus1':
            if(x1.toString('utf-8') == 'false'){
                client.publish("topic/"+event.srcElement.id,'true')
            }
            else{
                client.publish("topic/"+event.srcElement.id,'false')
            }
            break;
        case 'manual':
            if(x2.toString('utf-8') == 'false'){
                client.publish("topic/"+event.srcElement.id,'true')
            }
            else{
                client.publish("topic/"+event.srcElement.id,'false')
            }
            break;
        default:
            break;
    }
}

//Membuat chart
var ctx1 = document.getElementById('canvas1').getContext('2d');
var ctx2 = document.getElementById('canvas2').getContext('2d');
var ctx3 = document.getElementById('canvas3').getContext('2d');
ctx1.font='bold 30px Arial';
ctx2.font='bold';
ctx3.font='bold';


var config = [
    {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Humidity',
            backgroundColor: '#730505',
            borderColor: '#730505',
            data: [],
            fill: false,
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    suggestedMin: 0,
                    fontColor:'#730505',
                    fontweight:'bold',
                }
            }]
        }
    }
},
{
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperature',
            backgroundColor: '#730505',
            borderColor: '#730505',
            data: [],
            fill: false,
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    suggestedMin: 0,
                    fontColor:'#730505',
                    fontweight:'bold',
                }
            }]
        }
    }
},
{
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Brightness',
            backgroundColor: '#730505',
            borderColor: '#730505',
            data: [],
            fill: false,
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    suggestedMin: 0,
                    fontColor:'#730505',
                    fontweight:'bold'
                }
            }]
        }
    }
}];

var mychart1 = new Chart(ctx1, config[0]);
var mychart2 = new Chart(ctx2, config[1]);
var mychart3 = new Chart(ctx3, config[2]);

//Membuat Gauge
var gg1= new RadialGauge({
    renderTo: 'humidity_value', //data yang bersangkutan
    width: 200, //ukuran
    height: 200,
    units: '%', //satuan data
    title: 'Humidity', //judul
    value: 0, //nilai awal
    minValue: 0, //nilai paling rendah
    maxValue: 100, //nilai paling tinggi
    majorTicks: [
        '0','10','20','30','40','50','60','70','80','100'
    ], //skala utama
    minorTicks: 2, //skala minor
    strokeTicks: false,
    highlights: [
        { from: 0, to: 50, color: 'rgba(0,255,0,.15)' },
        { from: 50, to: 100, color: 'rgba(255,255,0,.15)' },
        { from: 100, to: 150, color: 'rgba(255,30,0,.25)' },
        { from: 150, to: 200, color: 'rgba(255,0,225,.25)' },
        { from: 200, to: 220, color: 'rgba(0,0,255,.25)' }
    ], //Warna pada range nilai tertentu
    colorPlate: '#222',
    colorMajorTicks: '#f5f5f5',
    colorMinorTicks: '#ddd',
    colorTitle: '#fff',
    colorUnits: '#ccc',
    colorNumbers: '#eee',
    colorNeedle: 'rgba(240, 128, 128, 1)',
    colorNeedleEnd: 'rgba(255, 160, 122, .9)',
    valueBox: true,
    animationRule: 'linear',
    animationDuration: 100
}).draw();

var gg2= new RadialGauge({
    renderTo: 'temperature_value', //data yang bersangkutan
    width: 200, //ukuran
    height: 200,
    units: '°C ', //satuan data
    title: 'Temperature', //judul
    value: 0, //nilai awal
    minValue: 0, //nilai minimum
    maxValue: 100, //nilai maksimum
    majorTicks: [
      '0','10','20','30','40','50','60','70','80','100'
    ], //Skala utama
    minorTicks: 2, //Skala minor
    strokeTicks: false,
    highlights: [
        { from: 0, to: 50, color: 'rgba(0,255,0,.15)' },
        { from: 50, to: 100, color: 'rgba(255,255,0,.15)' },
        { from: 100, to: 150, color: 'rgba(255,30,0,.25)' },
        { from: 150, to: 200, color: 'rgba(255,0,225,.25)' },
        { from: 200, to: 220, color: 'rgba(0,0,255,.25)' }
    ], //Warna pada rentang nilai tertentu
    colorPlate: '#222',
    colorMajorTicks: '#f5f5f5',
    colorMinorTicks: '#ddd',
    colorTitle: '#fff',
    colorUnits: '#ccc',
    colorNumbers: '#eee',
    colorNeedle: 'rgba(240, 128, 128, 1)',
    colorNeedleEnd: 'rgba(255, 160, 122, .9)',
    valueBox: true,
    animationRule: 'linear',
    animationDuration: 100
}).draw();

var gg3= new RadialGauge({
    renderTo: 'brightness_value', //data yang bersangkutan
    width: 200, //Ukuran gauge
    height: 200,
    units: 'lx', //Satuan data
    title: 'Brightness', //Judul
    value: 0, //nilai awal
    minValue: 0, //nilai minimum
    maxValue: 100, //nilai maksimum
    majorTicks: [
      '0','10','20','30','40','50','60','70','80','100'
    ], //Skala utama
    minorTicks: 2, //Skala minor
    strokeTicks: false,
    highlights: [
        { from: 0, to: 50, color: 'rgba(0,255,0,.15)' },
        { from: 50, to: 100, color: 'rgba(255,255,0,.15)' },
        { from: 100, to: 150, color: 'rgba(255,30,0,.25)' },
        { from: 150, to: 200, color: 'rgba(255,0,225,.25)' },
        { from: 200, to: 220, color: 'rgba(0,0,255,.25)' }
    ], //Warna pada rentang nilai tertentu
    colorPlate: '#222',
    colorMajorTicks: '#f5f5f5',
    colorMinorTicks: '#ddd',
    colorTitle: '#fff',
    colorUnits: '#ccc',
    colorNumbers: '#eee',
    colorNeedle: 'rgba(240, 128, 128, 1)',
    colorNeedleEnd: 'rgba(255, 160, 122, .9)',
    valueBox: true,
    animationRule: 'linear',
    animationDuration: 100
}).draw();

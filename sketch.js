import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
// import * as Tone from 'tone';
// import * as Tone from 'tone';

//data sourced from : Henrys, P.A.; Keith, A.M.; Robinson, D.A.; Emmett, B.A. (2012). Model estimates of topsoil invertebrates [Countryside Survey] NERC Environmental Information Data Centre. https://doi.org/10.5285/f19de821-a436-4b28-95f6-b7287ef0bf15


let light;
let material1, material2, material3, material4;
let isOn = false;
let yearDisp;

let pRate = [];
let sound2;
let sounds2 = [];
let players = [];
let sName = [];

let  type, info,  c;

let soil;
let sphere;

let collision;
let a;
let objects = [];

// arrays of xyz coordinates
let x = [];
let y = [];
let z = [];

//array of materials
let materials = [];
let materials2 = [];

// let checkM = isMobile();
let checkT = isMobileTablet();



// setup the camera
const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
camera.position.set(-40, 10, -40);

//create new scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

init();

//render and add to the canvas
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("sketch-container").appendChild( renderer.domElement );

// set 3d audio listener
const listener = new THREE.AudioListener();
camera.add( listener );

document.querySelector('button')?.addEventListener('click', async () => {
	await Tone.start()
	console.log('audio is ready')
})

// create slider and map it
let slider = document.getElementById("sliderYear");
let output = slider.value
let year = document.getElementById("yearVal");

yearDisp = Math.round(convertRange(output, [0, 100], [1998, 2007]));
year.innerHTML = yearDisp;
let yearseven = convertRange(output, [0, 100], [0, 0.7]);
let year98 = convertRange(output, [0, 100], [0.7, 0]);

// html variables
const h = document.getElementById('name');
// const p2 = document.getElementById('type');
const p = document.getElementById('info');



//camera controls
let controls = new OrbitControls(camera, renderer.domElement);
controls.update();

function init() {
  //load data file
  fetch("./json/soilinfo.json").then(function(response) {
    return response.json();
  }).then(function(data) {
    
    soil = data.contents;
   
    // draw the particles
   drawSoil();
  
  }).catch(function(err) {
    console.log(`Something went wrong: ${err}`);
  });
}

  //generate random int https://www.w3schools.com/JS/js_random.asp
  function getRnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }


// fix exposure and lighting of the HDR texture image
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.6;

// load HDR texture image, sourced from https://www.hdri-hub.com/hdrishop/freesamples/freehdri/item/117-hdr-041-path-free
const loader = new RGBELoader();
loader.load('imgs/HDR_041_Path_Ref.hdr', function(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
})


// add light to see
light = new THREE.PointLight( 0xfffafe, 1, 100 ); 
light.position.set(0, 10, 10);
scene.add( light );


// create raycaster and coordinates for mouse movement
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();


// track mouse movement and intersection with objects
function onMouseMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

}

function onHover() {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    // change colour if mouse is on object
    if (intersects.length > 0) {

        if (isOn == false) {
        for (a = 0; a < intersects.length; a++) {
 
        //check if mouse intersects with object
        objects.push(intersects[a].object)
        intersects[a].object.currentHex = intersects[a].object.material.emissive.getHex();
        intersects[a].object.material.emissive.setHex( 0xffcc00 );

        //get particle name
        let objName = intersects[a].object.userData.name;
        let objInfo = intersects[a].object.userData.info;
        // let objType = intersects[a].object.userData.type;
       

        // only show names of objects that can be seen
        if (intersects[a].object.material.opacity > 0) {
            h.className = 'tooltip show importantH';
        h.textContent = objName;
        p.className = 'tooltip show importantP';
        p.textContent = objInfo;
   
        }
       
        }
    }
        
    }
    else {
      
        if (isOn == false) {
        for (let b = 0; b < objects.length; b++) {
            //reset object colour and array
            if ( objects[b] ) objects[b].material.emissive.setHex( 0x00000);
            objects[b] = null

            //hide text when mouse not on object
            p.className = 'tooltip hide';
            // p2.className = 'tooltip hide';
            h.className = 'tooltip hide';

        }
    }

    }

  };

// click on particles to view
function onClick() {
 
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    // change colour if mouse is on object
    if (intersects.length > 0) {
        
        if (isOn == false) {
            isOn = true;
          
            for (a = 0; a < intersects.length; a++) {
 
                //check if mouse intersects with object
                objects.push(intersects[a].object)
                intersects[a].object.currentHex = intersects[a].object.material.emissive.getHex();
                intersects[a].object.material.emissive.setHex( 0xff0000 );
        
                //get particle name
                let objName = intersects[a].object.userData.name;
                let objInfo = intersects[a].object.userData.info;
                // let objType = intersects[a].object.userData.type;
                console.log(intersects[a].object)
        
                // only show names of objects that can be seen
                if (intersects[a].object.material.opacity > 0) {
                    h.className = 'tooltip show importantH';
                h.textContent = objName;
                p.className = 'tooltip show importantP';
                p.textContent = objInfo;

                
  
                }
               
                }
            
        } else if (isOn == true){
            isOn = false;
        
            for (let b = 0; b < objects.length; b++) {
                //reset object colour and array
                if ( objects[b] ) objects[b].material.emissive.setHex( 0x00000);
                objects[b] = null
    
                //hide text when mouse not on object
                p.className = 'tooltip hide';
                // p2.className = 'tooltip hide';
                h.className = 'tooltip hide';
    
            }
        }

        
    } 
}

let sounds1 = [];
function drawSoil() {
    
collision = false;
let value98;
let value07;
const geometry = new THREE.SphereGeometry(0.5, 64, 64);




    for (let i=0; i<soil.length; i++) {
        value07 = soil[i].amount07;
        value98 = soil[i].amount98;
        
        type = soil[i].type;
        info = soil[i].info;
        c = soil[i].color;

        material1 = new THREE.MeshPhysicalMaterial( { 
            roughness: 0.1,
            metalness: 0.3,
            transmission: 1,
            transparent: 1,
            opacity: yearseven,
            color: c } );
        material2 = new THREE.MeshPhysicalMaterial( { 
            roughness: 0.1,
            metalness: 0.3,
            transmission: 1,
            transparent: 1,
            opacity: year98,
            color: c } );

            materials.push(material1)
            materials2.push(material2)
           
       
            pRate[i] = getRnd(80, 100) /100;
            //set positional audio

            sName[i] = "sound/s" + i + ".ogg"

            
            let sound1 = new THREE.PositionalAudio( listener );
            Tone.setContext(sound1.context);
            let player = new Tone.Player
            ({
                    url: sName[i],
                    loop: true,
                    autostart: true,
                    // playbackRate: pRate[i],
                    
            });
            // const filter = new Tone.Filter(200, 'lowpass');
            // sound1.setFilter(filter)


            sound1.setNodeSource(player);
            
            sound1.setRefDistance( 3 );

            sounds1.push(sound1)
      
        
        // use same sphere positions in different years to see the difference easier
            for (let sPos = 0; sPos <500; sPos ++) {
                x[sPos] = getRnd(-10, 10)
                y[sPos] = getRnd(-10, 10)
                z[sPos] = getRnd(-10, 10)
            }
            
           
        //nutrients for year 2007
        for (let j = 0; j < value07; j ++) {
            
            if (type == "Carbon Concentration" || "Nitrogen" ||  "Moisture" || "Olsen-P" || "Invertebrates") {
              
                sphere = new THREE.Mesh(geometry, material1);
                sphere.position.set(x[j], y[j], z[j]);
                scene.add(sphere);

                //use data from json to give the particles names
                sphere.userData.nutrient = true;
                sphere.userData.name = type; 
                sphere.userData.info = info; 

                
               
               
            }

sphere.add(sounds1[i]);
        }

        //nutrients for year 1998
        for (let k = 0; k < value98; k ++) {
            
            if (type == "invertebrate" || "Carbon Concentration" || "Olsen-P" || "Nitrogen" || "Moisture") {
                
                sphere = new THREE.Mesh(geometry, material2);
                sphere.position.set(x[k], y[k], z[k]);
                scene.add(sphere);

             
                //use data from json to give the particles names
                sphere.userData.nutrient = true;
                sphere.userData.name = type; 
                sphere.userData.info = info; 
                
            }
        }
    }

}




// scale values: https://stackoverflow.com/questions/14224535/scaling-between-two-number-ranges
function convertRange( value, r1, r2 ) { 
    return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}


window.addEventListener('resize', onWindowResize);
window.addEventListener( 'mousemove', onMouseMove, false);
window.addEventListener( 'click', onClick );


// check if device is touchscreen, 01/05/2023: https://medium.com/simplejs/detect-the-users-device-type-with-a-simple-javascript-check-4fc656b735e1
function isMobileTablet(){
    var check = false;
    (function(a){
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) 
            check = true;
    })(navigator.userAgent||navigatorID.vendor||window.opera);
    return check;
}



//animate or update
function animate() {
    
    requestAnimationFrame( animate ); 
    
    //use hover function only in Desktop mode
    checkT = isMobileTablet();
    if (checkT == false) {
        onHover();
    }
  
    //change opacity on input of slider
    slider.oninput = function() {
        
        output = this.value;
        yearDisp = Math.round(convertRange(output, [0, 100], [1998, 2007]));
        year.innerHTML = yearDisp;
        yearseven = convertRange(output, [0, 100], [0, 0.7]);
        year98 = convertRange(output, [0, 100], [0.7, 0]);
        
       for (let i = 0; i< soil.length; i++) {
        materials[i].opacity = yearseven;
        materials2[i].opacity = year98;
       }
   
        }
   
	renderer.render( scene, camera );
};


animate();


function onWindowResize() {
    
    // windowW = window.innerWidth;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


}

import {useEffect, useRef, useState} from "react";
import * as THREE from 'three';
import {Slider} from '@mui/material';
import Typography from '@mui/material/Typography';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import './App.css';


const renderDimensions = {
    width: window.innerWidth / 2,
    height: window.innerHeight / 2
};


function handleWindowChange(camera, renderer, scene) {
    camera.aspect = renderDimensions.width / renderDimensions.height;
    camera.updateProjectionMatrix();
    renderer.setSize(renderDimensions.width, renderDimensions.height);
    renderer.render(scene, camera);
}

function insertRendererInDocument(renderer) {
    // Hack to insert renderer between the other React components
    const container = document.getElementById("container");
    const appContainer = document.getElementsByClassName("App")[0];
    appContainer.insertBefore(renderer.domElement, container);
}

function setCubeRaycaster(renderer, camera, cubeRef, materials, setColorLabel) {
    const raycaster = new THREE.Raycaster();
    const typographyContainer = document.getElementsByClassName("typography-container")[0];
    renderer.domElement.addEventListener("mousedown", (event) => {
        const coords = new THREE.Vector2(
            (event.offsetX / (renderer.domElement.clientWidth)) * 2 - 1,
            -((event.offsetY / renderer.domElement.clientHeight) * 2 - 1),
        );
        raycaster.setFromCamera(coords, camera);
        const intersections = raycaster.intersectObject(cubeRef.current, true);
        if (intersections.length > 0) {
            const faceIndex = intersections[0].face.materialIndex;
            const color = materials[faceIndex].name;
            setColorLabel(color);
            typographyContainer.style.backgroundColor = color;
        } else {
            setColorLabel("");
            typographyContainer.style.backgroundColor = "#D3D3D3";
        }
    });
}

function App() {
    const [colorLabel, setColorLabel] = useState("");
    const rendererRef = useRef(null);
    const cubeRef = useRef(null);

    useEffect(() => {
        // Setup scene
        const scene = new THREE.Scene();

        // Setup renderer
        const renderer = new THREE.WebGLRenderer();
        insertRendererInDocument(renderer);
        renderer.setSize(renderDimensions.width, renderDimensions.height);
        rendererRef.current = renderer;

        // Setup camera
        const camera = new THREE.PerspectiveCamera(75, renderDimensions.width / renderDimensions.height, 0.1, 1000);
        const controls = new OrbitControls(camera, renderer.domElement);
        camera.position.z = 5;

        // Setup Cube
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const materials = [
            new THREE.MeshBasicMaterial({color: 'red', name: 'Red'}),
            new THREE.MeshBasicMaterial({color: 'orange', name: 'Orange'}),
            new THREE.MeshBasicMaterial({color: 'yellow', name: 'Yellow'}),
            new THREE.MeshBasicMaterial({color: 'white', name: 'White'}),
            new THREE.MeshBasicMaterial({color: 'blue', name: 'Blue'}),
            new THREE.MeshBasicMaterial({color: 'green', name: 'Green'}),
        ];
        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);
        cubeRef.current = cube;

        // Setup raycaster and listeners
        setCubeRaycaster(renderer, camera, cubeRef, materials, setColorLabel)
        window.addEventListener("resize", () => {
            handleWindowChange(camera, renderer, scene)
        });
        window.addEventListener("scroll", () => {
            handleWindowChange(camera, renderer, scene)
        });

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }

        animate();
    }, []);

    const handleSliderChange = (event) => {
        cubeRef.current.rotation.y = event.target.value * Math.PI / 180;
    }

    return (
        <div className="App">
            <div id="title" className="flex-container">
                <Typography variant="h2">
                    Interactive 3D Cube
                </Typography>
            </div>
            <hr/>
            <div id="container" className="flex-container">
                <div className="slider-container">
                    <Slider id="slider" defaultValue={0} min={0} max={360} onChange={handleSliderChange}/>
                </div>
                <div className="typography-container">
                    <Typography variant="h3" align="center">
                        {colorLabel}
                    </Typography>
                </div>
            </div>
        </div>
    );
}

export default App;

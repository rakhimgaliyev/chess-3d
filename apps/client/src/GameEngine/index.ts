import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI, Controller } from 'three/examples/jsm/libs/lil-gui.module.min';
import Stats from 'three/examples/jsm/libs/stats.module';
import { AnimationAction } from 'three';

const baseActions = {
  idle: {weight: 1},
  walk: {weight: 0},
  run: {weight: 0}
};

const additiveActions = {
  sneak_pose: {weight: 0},
  sad_pose: {weight: 0},
  agree: {weight: 0},
  headShake: {weight: 0}
};

export class GameEngine {
  // @ts-ignore
  #rootEl: HTMLElement;
  // @ts-ignore
  #scene: THREE.Scene;
  // @ts-ignore
  #camera: THREE.PerspectiveCamera;
  // @ts-ignore
  #renderer: THREE.WebGLRenderer;
  // @ts-ignore
  #clock: THREE.Clock;

  // @ts-ignore
  #model: THREE.Group;
  // @ts-ignore
  #skeleton: THREE.SkeletonHelper;
  // @ts-ignore
  #mixer: THREE.AnimationMixer;
  // @ts-ignore
  #stats: Stats;
  // @ts-ignore
  #panelSettings;

  // @ts-ignore
  #numAnimations: number = 0;
  // @ts-ignore
  #allActions: AnimationAction[] = [];
  // @ts-ignore
  #crossFadeControls: Controller[] = [];

  // @ts-ignore
  #currentBaseAction = 'idle'

  setup(rootEl: HTMLElement) {
    this.#initVariables(rootEl)

    this.#setLight();
    this.#setGround();

    this.#createPanel();

    this.#setBot();
  }

  start() {
    this.#animate();
  }

  onResize() {
    this.#camera.aspect = window.innerWidth / window.innerHeight;
    this.#camera.updateProjectionMatrix();
    this.#renderer.setSize(window.innerWidth, window.innerHeight);
  }

  #initVariables(rootEl: HTMLElement) {
    this.#initRenderer(rootEl);
    this.#initScene();
    this.#initClock();
    this.#initCamera();
    this.#initStats();
  }

  #initRenderer(rootEl: HTMLElement) {
    this.#rootEl = rootEl;

    this.#renderer = new THREE.WebGLRenderer({antialias: true});
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(window.innerWidth, window.innerHeight);
    this.#renderer.shadowMap.enabled = true;
    this.#renderer.setSize(window.innerWidth, window.innerHeight);

    this.#rootEl.appendChild(this.#renderer.domElement);
  }

  #initScene() {
    this.#scene = new THREE.Scene();
    this.#scene.background = new THREE.Color(0xa0a0a0);
    this.#scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
  }

  #initClock() {
    this.#clock = new THREE.Clock();
  }

  #initCamera() {
    this.#camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
    this.#camera.position.set(-1, 2, 3);

    const controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, 1, 0);
    controls.update();
  }

  #initStats() {
    this.#stats = new Stats();
    this.#rootEl.appendChild(this.#stats.dom);
  }

  #setLight() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    this.#scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(3, 10, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    this.#scene.add(dirLight);
  }


  #setGround() {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({
      color: 0x999999,
      depthWrite: false
    }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.#scene.add(mesh);
  }

  #setBot() {
    const loader = new GLTFLoader();
    loader.load('models/gltf/Xbot.glb', (gltf) => {

      this.#model = gltf.scene;
      this.#scene.add(this.#model);

      this.#skeleton = new THREE.SkeletonHelper(this.#model);
      this.#skeleton.visible = false;
      this.#scene.add(this.#skeleton);

      const animations = gltf.animations;
      this.#mixer = new THREE.AnimationMixer(this.#model);

      this.#numAnimations = animations.length;

      for (let i = 0; i !== this.#numAnimations; ++i) {
        let clip = animations[i];

        const name = clip.name;

        // @ts-ignore
        if (baseActions[name]) {

          const action = this.#mixer.clipAction(clip);
          this.#activateAction(action);
          // @ts-ignore
          baseActions[name].action = action;
          this.#allActions.push(action);

          // @ts-ignore
        } else if (additiveActions[name]) {

          // Make the clip additive and remove the reference frame

          THREE.AnimationUtils.makeClipAdditive(clip);

          if (clip.name.endsWith('_pose')) {

            clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);

          }

          const action = this.#mixer.clipAction(clip);
          this.#activateAction(action);
          // @ts-ignore
          additiveActions[name].action = action;
          this.#allActions.push(action);
        }
      }
    });
  }

  #activateAction(action: THREE.AnimationAction) {
    const clip = action.getClip();
    // @ts-ignore
    const settings = baseActions[clip.name] || additiveActions[clip.name];
    this.#setWeight(action, settings.weight);
    action.play();
  }

  #setWeight(action: THREE.AnimationAction, weight: number) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }

  #animate() {
    requestAnimationFrame(() => this.#animate());

    for (let i = 0; i < this.#numAnimations; i++) {
      const action = this.#allActions[i];
      const clip = action.getClip();
      // @ts-ignore
      const settings = baseActions[clip.name] || additiveActions[clip.name];
      settings.weight = action.getEffectiveWeight();
    }

    // Get the time elapsed since the last frame, used for mixer update

    const mixerUpdateDelta = this.#clock.getDelta();

    // Update the animation mixer, the stats panel, and render this frame

    this.#mixer?.update(mixerUpdateDelta);

    this.#stats.update();

    this.#renderer.render(this.#scene, this.#camera);
  }

  #createPanel() {
    const panel = new GUI({width: 310});

    const folder1 = panel.addFolder('Base Actions');
    const folder2 = panel.addFolder('Additive Action Weights');
    const folder3 = panel.addFolder('General Speed');
    this.#panelSettings = {
      'modify time scale': 1.0
    };

    const baseNames = ['None', ...Object.keys(baseActions)];

    for (let i = 0, l = baseNames.length; i !== l; ++i) {

      const name = baseNames[i];
      // @ts-ignore
      const settings = baseActions[name];
      this.#panelSettings[name] = () => {

        // @ts-ignore
        const currentSettings = baseActions[this.#currentBaseAction];
        const currentAction = currentSettings ? currentSettings.action : null;
        const action = settings ? settings.action : null;

        if (currentAction !== action) {

          this.#prepareCrossFade(currentAction, action, 0.35);

        }

      };

      this.#crossFadeControls.push(folder1.add(this.#panelSettings, name));

      for (const name of Object.keys(additiveActions)) {

        // @ts-ignore
        const settings = additiveActions[name];

        this.#panelSettings[name] = settings.weight;
        folder2.add(this.#panelSettings, name, 0.0, 1.0, 0.01).listen().onChange((weight: number) => {
          this.#setWeight(settings.action, weight);
          settings.weight = weight;
        });

      }

      folder3.add(this.#panelSettings, 'modify time scale', 0.0, 1.5, 0.01).onChange(this.#modifyTimeScale);

      folder1.open();
      folder2.open();
      folder3.open();

      this.#crossFadeControls.forEach((control) => {
        control.setInactive = () => {
          control.domElement.classList.add('control-inactive');
        };

        control.setActive = () => {
          control.domElement.classList.remove('control-inactive');
        };

        const settings = baseActions[control.property];

        if (!settings || !settings.weight) {
          control.setInactive();
        }
      });
    }
  }

  #modifyTimeScale = (speed: number) => {
    this.#mixer.timeScale = speed;
  }


  #prepareCrossFade(startAction: AnimationAction, endAction: AnimationAction, duration: number) {
    // If the current action is 'idle', execute the crossfade immediately;
    // else wait until the current action has finished its current loop

    if (this.#currentBaseAction === 'idle' || !startAction || !endAction) {
      this.#executeCrossFade(startAction, endAction, duration);
    } else {
      this.#synchronizeCrossFade(startAction, endAction, duration);
    }

    // Update control colors

    if (endAction) {
      const clip = endAction.getClip();
      this.#currentBaseAction = clip.name;
    } else {
      this.#currentBaseAction = 'None';
    }

    this.#crossFadeControls.forEach((control) => {
      const name = control.property;

      if (name === this.#currentBaseAction) {
        control.setActive();
      } else {
        control.setInactive();
      }
    });
  }


  #synchronizeCrossFade(startAction: AnimationAction, endAction: AnimationAction, duration: number) {
    const onLoopFinished = (event) => {
      if (event.action === startAction) {
        this.#mixer.removeEventListener('loop', onLoopFinished);
        this.#executeCrossFade(startAction, endAction, duration);
      }
    }

    this.#mixer.addEventListener('loop', onLoopFinished);
  }

  #executeCrossFade(startAction: AnimationAction, endAction: AnimationAction, duration: number) {
    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)
    if (endAction) {
      this.#setWeight(endAction, 1);
      endAction.time = 0;

      if (startAction) {
        // Crossfade with warping
        startAction.crossFadeTo(endAction, duration, true);

      } else {
        // Fade in
        endAction.fadeIn(duration);
      }
    } else {
      // Fade out
      startAction.fadeOut(duration);
    }
  }
}

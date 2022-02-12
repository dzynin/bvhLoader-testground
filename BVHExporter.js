// import * as fflate from '../libs/fflate.module.js';
import {
    AnimationClip,
    // Bone,
    // FileLoader,
    // Loader,
    Quaternion,
    QuaternionKeyframeTrack,
    // Skeleton,
    Vector4,
    Vector3,
    VectorKeyframeTrack,
    KeyframeTrack,
    Skeleton,
    Euler,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    Scene
} from 'three';

// const exporter = new USDZExporter();
// const arraybuffer = await exporter.parse( gltf.scene );

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_With_Private_Class_Features
//https://discourse.threejs.org/t/get-euler-between-two-vector3s/5016


// Exporting BVH from three.js clip and skeleton
class BVHExporter {
    #bvh = ``;
    get bvh() {
        return this.#bvh || ''
    }
    set bvh(string) {
        this.#bvh = string
    }
    // constructor(bvh = `here`) {
    //     // this.#bvh = bvh
    // }

    writeLine(line) {
        if (typeof line === "string") {
            this.#bvh += `${line}\n`;
        } else {
            throw new Error('Invalid line.');
        }
    }


    validateInputs(skeleton, clip) {

        if (!skeleton instanceof Skeleton) {
            throw new Error('Invalid skeleton.');
        }

        if (!clip instanceof AnimationClip || !clip.validate()) {
            throw new Error('Invalid clip.');
        }

        //refactor
        const fliteredTracks = clip.tracks.filter((track) => track instanceof VectorKeyframeTrack)

        const fliteredSkeletonBones = skeleton.bones.filter(bone => bone.name !== "ENDSITE")

        // compare both hierarchy
        for (let i = 0; i < fliteredTracks.length; i++) {// I saw three.js's classes using let so It's should be fine.
            if (!fliteredTracks[i].name.match(/\[(.*?)\]/)[1] === fliteredSkeletonBones[i].name) throw new Error('Unmatch hierarchies of clip and skeleton, cannot process.');
        }

    }

    parseHierarchyBone(bone, skeleton, identLevel) {
        let indent = ``
        for (let i = 1; i <= identLevel; i++) {
            indent += "  "
        }
        if (bone.name === skeleton.bones[0].name) {// checks if it's root
            this.writeLine(`ROOT ${bone.name}`);
            this.writeLine(`{`);
            this.writeLine(`  OFFSET 0 0 0`)
            this.writeLine(`  CHANNELS 6 Xposition Yposition Zposition Zrotation Yrotation Xrotation`)
            if (bone.children.length > 0) {
                bone.children.forEach(bone => {
                    this.parseHierarchyBone(bone, skeleton, identLevel + 1)
                });
            }
            this.writeLine(`}`);
            return
        }
        if (bone.name === "ENDSITE") {
            this.writeLine(`${indent}End Site`);
            this.writeLine(`${indent}{`);
            this.writeLine(`${indent}  OFFSET ${bone.position?.x ?? 0} ${bone.position?.y ?? 0} ${bone.position?.z ?? 0}`)
            if (bone.children.length > 0) {
                bone.children.forEach(bone => {
                    this.parseHierarchyBone(bone, skeleton, identLevel + 1)
                });
            }
            this.writeLine(`${indent}}`);
            return
        }
        else {
            this.writeLine(`${indent}JOINT ${bone.name}`);
            this.writeLine(`${indent}{`);
            this.writeLine(`${indent}  OFFSET ${bone.position?.x ?? 0} ${bone.position?.y ?? 0} ${bone.position?.z ?? 0}`)
            this.writeLine(`${indent}  CHANNELS 3 Zrotation Xrotation Yrotation`)
            if (bone.children.length > 0 && bone.name !== skeleton.bones[0].name) {
                bone.children.forEach(bone => {
                    this.parseHierarchyBone(bone, skeleton, identLevel + 1)
                });
            }
            this.writeLine(`${indent}}`);
            return
        }

    };

    parseMotionFrame(tracks, bones, frameIndex) {
        // vkft -> v -> q -> AxisAngle
        // console.log('frameIndex', frameIndex)
        // console.log('tracks', tracks)
        // console.log('bones', bones)

        // bvh rotation = initial rotation * motion rotation // i guess
        // https://stackoverflow.com/questions/63243446/how-to-get-rotationeuler-angle-between-two-3d-vectors-to-make-bvh-format
        // https://discourse.threejs.org/t/get-euler-between-two-vector3s/5016

        let line = ''

        const fliteredBones = bones.filter(bone => bone.name !== "ENDSITE")

        // loop though every bone, get motion q
        fliteredBones.forEach((bone, index) => {
            const [vKFTrack, qKFTrack] = [tracks[index], tracks[index + 1]];
            let [mqx, mqy, mqz, mqw] = ["0.0", "0.0", "0.0", "0.0"]; // a motion rotation q of a bone in a frame
            // console.log("bone", bone);
            let initFrameQ = null;  // a initial rotation q of a bone in a frame
            let offsetFrameQ = null;
            if (index === 0 && frameIndex === 0) {
                const [rootPx, rootPy, rootPz] = [
                    parseFloat(vKFTrack.values[0].toFixed(4)),
                    parseFloat(vKFTrack.values[1].toFixed(4)),
                    parseFloat(vKFTrack.values[2].toFixed(4)),
                ];
                line += `${rootPx} ${rootPy} ${rootPz} `
                initFrameQ = new Vector3();
                offsetFrameQ = new Vector3();
            }
            else {
                // initFrameQ = new Vector3()
                // console.log("bone", bone);

                offsetFrameQ = new Vector3(vKFTrack.values[0], vKFTrack.values[1], vKFTrack.values[2]);
                // console.log("offsetFrameQ", offsetFrameQ);
                [mqx, mqy, mqz, mqw] = [
                    qKFTrack.values[0],
                    qKFTrack.values[1],
                    qKFTrack.values[2],
                    qKFTrack.values[3],
                ]

            }

            // const motionFrameQ = new Quaternion(mqx, mqy, mqz, mqw);
            // console.log("motionFrameQ", motionFrameQ);
            // const angle = bone.quaternion.angleTo(motionFrameQ);
            // console.log("angle", angle);
            // const conjugate = new Quaternion(iqx, iqy, iqz, iqw)
            // console.log("asd", conjugate);
        });

        // this.writeLine(line);


        // console.log("line", line);

        // root
        // const [rootPx, rootPy, rootPz] = [tracks[frameIndex].values[0], tracks[frameIndex].values[1], tracks[frameIndex].values[2]];
        // line += `${px} ${py} ${pz} `
        // console.log("tracks[frameIndex]", tracks[frameIndex]);
        // console.log("line", line);

        // dep

        // if (tracks.length > 2 && bones.length > 0) {
        //     // root
        //     const [vKFTrack, qKFTrack] = [tracks[0], tracks[1]];
        //     // console.log('vKFTrack', vKFTrack);
        //     // console.log('qKFTrack', qKFTrack);

        //     if (line === "") {
        //         // const position = { px, py, pz }

        //         let [px, py, pz] = [
        //             parseFloat(vKFTrack.values[0].toFixed(4)),
        //             parseFloat(vKFTrack.values[1].toFixed(4)),
        //             parseFloat(vKFTrack.values[2].toFixed(4)),
        //         ];

        //         let [qx, qy, qz, qw] = [
        //             parseFloat(qKFTrack.values[0]),
        //             parseFloat(qKFTrack.values[1]),
        //             parseFloat(qKFTrack.values[2]),
        //             parseFloat(qKFTrack.values[3]),
        //         ]

        //         let e = new Euler();
        // const quat = new Quaternion(qx, qy, qz, qw);
        //         e = e.setFromQuaternion(quat);
        //         //Zrotation Xrotation Yrotation
        //         const { x: ex, y: ey, z: ez } = e;

        //         line += `${px} ${py} ${pz} ${ez} ${ex} ${ey} `// channal order of bvh

        //         this.parseMotionFrame(tracks, bones, line, frameIndex)
        //     }
        //     else {

        //         let [qx, qy, qz, qw] = [
        //             parseFloat(qKFTrack.values[0]),
        //             parseFloat(qKFTrack.values[1]),
        //             parseFloat(qKFTrack.values[2]),
        //             parseFloat(qKFTrack.values[3]),
        //         ]

        //         // parseFloat(tracks[1].values[0]).toFixed(parseFloat(tracks[1].values[0]) === 0 ? 1 : 4),

        //         let e = new Euler();

        //         const frameQ = new Quaternion(qx, qy, qz, qw);

        //         e = e.setFromQuaternion(frameQ, "XYZ");

        //         //Zrotation Xrotation Yrotation
        //         const { x: ex, y: ey, z: ez } = e;

        //         line += `${ez} ${ex} ${ey} `// channal order of bvh

        //         this.parseMotionFrame(tracks, bones, line, frameIndex)
        //     }

        // } else {
        //     console.log("end motion frame parsing");
        //     this.writeLine(line);
        //     this.parseMotionFrame(tracks, bones, "", frameIndex++)
        // }

    }


    parseHierarchy(skeleton) {
        this.writeLine(`HIERARCHY`);
        this.parseHierarchyBone(skeleton.bones[0], skeleton, 0)
    }

    parseMotion(clip, skeleton) {
        const frameCount = clip.tracks[0].times.length;
        // this.writeLine(`MOTION`);
        // this.writeLine(`Frames:	${frameCount}`);
        // this.writeLine(`Frame Time:	${(clip.tracks[0].times[clip.tracks[0].times.length - 1] / (clip.tracks[0].times.length - 1)).toFixed(8)}`);
        // const tracks = { ...clip.tracks }
        // console.log("tracks", tracks);


        // loop, every frames
        // for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
        //     // console.log("frameIndex", frameIndex);
        //     // func, passing bone, track, write line.
        //     this.parseMotionFrame(clip.tracks, skeleton.bones, frameIndex)
        // }
        // frame 0
        this.parseMotionFrame(clip.tracks, skeleton.bones, 0)
    }

    // constructor(validateInputs) {
    //     this.validateInputs = validateInputs;
    // }

    //arguments:
    // onDone, callback to return bvh

    parse(skeleton, clip, onDone) {
        // const asd = new Vector4
        // console.log("Vector4.setAxisAngleFromQuaternion", Vector4.setAxisAngleFromQuaternion);
        this.validateInputs(skeleton, clip);

        this.parseHierarchy(skeleton);

        this.parseMotion(clip, skeleton);

        // onDone(this.bvh)

        onDone()

        // console.log(this.bvh);


        // let HIERARCHY, MOTION, BVH;
        // let HIERARCHY = `HIERARCHY\n` // Bvh's HIERARCHY part
        // // HIERARCHY += `ROOT hip\n`

        // // get skeleton object to HIERARCHY
        // // three.js bones to bvh bones
        // const skeletonBones = skeleton.bones
        // function parseHierarchyBone(bone) {
        //     // todo
        //     skeletonBones.shift();
        // }
        // parseHierarchyBone(skeletonBones[0])

        // function parsePoints(points) {

        //     let nbVertex = 0;
        //     const geometry = points.geometry;

        //     if (geometry.isBufferGeometry !== true) {

        //         throw new Error('THREE.OBJExporter: Geometry is not of type THREE.BufferGeometry.');

        //     }

        //     const vertices = geometry.getAttribute('position');
        //     const colors = geometry.getAttribute('color');
        //     output += 'o ' + points.name + '\n';

        //     if (vertices !== undefined) {

        //         for (let i = 0, l = vertices.count; i < l; i++, nbVertex++) {

        //             vertex.fromBufferAttribute(vertices, i);
        //             vertex.applyMatrix4(points.matrixWorld);
        //             output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z;

        //             if (colors !== undefined) {

        //                 color.fromBufferAttribute(colors, i);
        //                 output += ' ' + color.r + ' ' + color.g + ' ' + color.b;

        //             }

        //             output += '\n';

        //         }

        //     }

        //     output += 'p ';

        //     for (let j = 1, l = vertices.count; j <= l; j++) {

        //         output += indexVertex + j + ' ';

        //     }

        //     output += '\n'; // update index

        //     indexVertex += nbVertex;

        // }// ref

        // // let MOTION 
        // // get animationClip to MOTION


        // // return result by calling callBack
        // onDone(BVH = `${HIERARCHY}\n${MOTION}`)

    }
}


export { BVHExporter };
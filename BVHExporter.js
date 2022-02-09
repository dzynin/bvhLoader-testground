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
    Skeleton
} from 'three';

// const exporter = new USDZExporter();
// const arraybuffer = await exporter.parse( gltf.scene );

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_With_Private_Class_Features


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

    parseMotionFrame(tracks, bones, line) {
        // vkft -> v -> q -> AxisAngle

        function getAxisAndAngelFromQuaternion(q) {
            const angle = 2 * Math.acos(q.w);
            var s;
            if (1 - q.w * q.w < 0.000001) {
                // test to avoid divide by zero, s is always positive due to sqrt
                // if s close to zero then direction of axis not important
                // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/
                s = 1;
            } else {
                s = Math.sqrt(1 - q.w * q.w);
            }
            return { axis: new Vector3(q.x / s, q.y / s, q.z / s), angle };
        }

        // console.log("bones", bones);
        // console.log("tracks", tracks);

        // console.log("Vector4", Vector4.setAxisAngleFromQuaternion());

        //Vector4.setAxisAngleFromQuaternion()

        // console.log("bones", bones);
        // console.log('tracks', tracks);

        if (tracks.length > 2 && bones.length > 0) {
            // root
            const [vKFTrack, qKFTrack] = [tracks[0], tracks[1]];
            console.log('vKFTrack', vKFTrack);
            console.log('qKFTrack', qKFTrack);

            if (line === "") {
                // const position = { px, py, pz }

                let [px, py, pz] = [
                    parseFloat(vKFTrack.values[0].toFixed(4)),
                    parseFloat(vKFTrack.values[1].toFixed(4)),
                    parseFloat(vKFTrack.values[2].toFixed(4)),
                ];

                let [qx, qy, qz, qw] = [
                    parseFloat(qKFTrack.values[0]),
                    parseFloat(qKFTrack.values[1]),
                    parseFloat(qKFTrack.values[2]),
                    parseFloat(qKFTrack.values[3]),
                ]

                const quat = new Quaternion(qx, qy, qz, qw);

                const result = getAxisAndAngelFromQuaternion(quat);

                const { x: ax, y: ay, z: az } = result.axis;

                line += `${px} ${py} ${pz} ${az} ${ay} ${ax} `// channal order of bvh

                this.parseMotionFrame([...tracks.slice(2)], [...bones.slice(1)], line)
            }
            else {

                // let [px, py, pz] = [
                //     parseFloat(vKFTrack.values[0].toFixed(4)),
                //     parseFloat(vKFTrack.values[1].toFixed(4)),
                //     parseFloat(vKFTrack.values[2].toFixed(4)),
                // ];

                let [qx, qy, qz, qw] = [
                    parseFloat(qKFTrack.values[0]),
                    parseFloat(qKFTrack.values[1]),
                    parseFloat(qKFTrack.values[2]),
                    parseFloat(qKFTrack.values[3]),
                ]

                // parseFloat(tracks[1].values[0]).toFixed(parseFloat(tracks[1].values[0]) === 0 ? 1 : 4),

                const quat = new Quaternion(qx, qy, qz, qw);

                const result = getAxisAndAngelFromQuaternion(quat);

                console.log("result", result);

                const { x: ax, y: ay, z: az } = result.axis;

                line += `${result.angle * az} ${result.angle * ay} ${result.angle * ax} `// channal order of bvh

                this.parseMotionFrame([...tracks.slice(2)], [...bones.slice(1)], line)
            }

        } else {
            console.log("end motion parsing");
            this.writeLine(line);
        }

    }


    parseHierarchy(skeleton) {
        this.writeLine(`HIERARCHY`);
        this.parseHierarchyBone(skeleton.bones[0], skeleton, 0)
    }

    parseMotion(clip, skeleton) {
        // this.writeLine(`MOTION`);
        // this.writeLine(`Frames:	${clip.tracks[0].times.length}`);
        // this.writeLine(`Frame Time:	${(clip.tracks[0].times[clip.tracks[0].times.length - 1] / (clip.tracks[0].times.length - 1)).toFixed(8)}`);
        // todo: loop by frame
        // const tracks = { ...clip.tracks }
        this.parseMotionFrame(clip.tracks, skeleton.bones, "")
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

        onDone(this.bvh)

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
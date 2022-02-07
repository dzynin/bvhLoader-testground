// import * as fflate from '../libs/fflate.module.js';
import {
    AnimationClip,
    // Bone,
    // FileLoader,
    // Loader,
    // Quaternion,
    // QuaternionKeyframeTrack,
    // Skeleton,
    // Vector3,
    // VectorKeyframeTrack
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
    //     this.#bvh = bvh
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

        const fliteredTracks = clip.tracks.reduce((result, track) => {
            // three.js's clip tracks stores all types of track in to a single array, bad for referencing, filtering out into one of any type.
            if (result.length === 0 || result[result.length - 1].constructor.name === track.constructor.name) {
                result.push(track);
            }
            return result
        }, [])

        const fliteredSkeletonBones = skeleton.bones.filter(bone => bone.name !== "ENDSITE")

        // compare both hierarchy
        for (let i = 0; i < fliteredTracks.length; i++) {// I saw three.js's classes using let so It's should be fine.
            if (!fliteredTracks[i].name.match(/\[(.*?)\]/)[1] === fliteredSkeletonBones[i].name) throw new Error('Unmatch hierarchies of clip and skeleton, cannot process.');
        }

    }

    parseHierarchyBone(bone, skeleton, identLevel) {
        console.log("bone", bone);
        if (!bone.parent.name) {// checks if it's root
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
        } else {
            let indent = ``
            for (let i = 1; i <= identLevel; i++) {
                indent += "  "
            }
            this.writeLine(`${indent}JOINT ${bone.name}`);
            this.writeLine(`${indent}{`);
            this.writeLine(`${indent}  OFFSET 0 0 0`)
            this.writeLine(`${indent}  CHANNELS 3 Zrotation Xrotation Yrotation`)
            if (bone.children.length > 0) {
                bone.children.forEach(bone => {
                    this.parseHierarchyBone(bone, skeleton, identLevel + 1)
                });
            }
            this.writeLine(`${indent}}`);
        }

    };


    parseHierarchy(skeleton) {
        this.parseHierarchyBone(skeleton.bones[0], skeleton, 0)
    }

    parseMotion(clip) {

    }

    // constructor(validateInputs) {
    //     this.validateInputs = validateInputs;
    // }

    //arguments:
    // onDone, callback to return bvh

    parse(skeleton, clip, onDone) {

        this.validateInputs(skeleton, clip);

        this.parseHierarchy(skeleton);

        console.log(this.bvh);

        // this.parseMotion(clip);

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
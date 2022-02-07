// import * as fflate from '../libs/fflate.module.js';
import {
    AnimationClip,
    Bone,
    FileLoader,
    Loader,
    Quaternion,
    QuaternionKeyframeTrack,
    Skeleton,
    Vector3,
    VectorKeyframeTrack
} from 'three';

// const exporter = new USDZExporter();
// const arraybuffer = await exporter.parse( gltf.scene );


// Exporting BVH from three.js clip and skeleton
class BVHExporter {

    #validateSkeleton = (skeleton) => (skeleton.hasOwnProperty("bones") && Array.isArray(skeleton.bones) && (skeleton.bones.length > 0) && (skeleton.bones[0].type === "Bone"))
    #validateInputs = () => {

    }

    constructor(validateSkeleton, validateInputs) {
        this.#validateSkeleton = validateSkeleton;
        this.#validateInputs = validateInputs;
    }

    //arguments:
    // skeleton
    // clip
    // onDone, callback to return bvh

    parse(skeleton, clip, onDone) {
        // console.log("skeleton.bones[0].type", skeleton.bones[0].name === "hip");
        // check if both are valid.
        if (this.#validateSkeleton(skeleton) == false) {
            throw new Error('Invalid skeleton.');
        }

        if (!clip?.validate()) {
            throw new Error('Invalid clip.');
        }
        // let HIERARCHY, MOTION, BVH;
        let HIERARCHY = `HIERARCHY\n` // Bvh's HIERARCHY part
        // HIERARCHY += `ROOT hip\n`

        // get skeleton object to HIERARCHY
        // three.js bones to bvh bones
        const skeletonBones = skeleton.bones
        function parseBone(bone) {
            // todo
            skeletonBones.shift();
        }
        parseBone(skeletonBones[0])

        function parsePoints(points) {

            let nbVertex = 0;
            const geometry = points.geometry;

            if (geometry.isBufferGeometry !== true) {

                throw new Error('THREE.OBJExporter: Geometry is not of type THREE.BufferGeometry.');

            }

            const vertices = geometry.getAttribute('position');
            const colors = geometry.getAttribute('color');
            output += 'o ' + points.name + '\n';

            if (vertices !== undefined) {

                for (let i = 0, l = vertices.count; i < l; i++, nbVertex++) {

                    vertex.fromBufferAttribute(vertices, i);
                    vertex.applyMatrix4(points.matrixWorld);
                    output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z;

                    if (colors !== undefined) {

                        color.fromBufferAttribute(colors, i);
                        output += ' ' + color.r + ' ' + color.g + ' ' + color.b;

                    }

                    output += '\n';

                }

            }

            output += 'p ';

            for (let j = 1, l = vertices.count; j <= l; j++) {

                output += indexVertex + j + ' ';

            }

            output += '\n'; // update index

            indexVertex += nbVertex;

        }// ref

        // let MOTION 
        // get animationClip to MOTION


        // return result by calling callBack
        onDone(BVH = `${HIERARCHY}\n${MOTION}`)

    }
}


export { BVHExporter };
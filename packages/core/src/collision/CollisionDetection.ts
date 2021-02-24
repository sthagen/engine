import { BoundingBox, Vector3 } from "@oasis-engine/math";
import { EventDispatcher } from "../base/EventDispatcher";
import { ACollider } from "../collider";
import { ABoxCollider } from "../collider/ABoxCollider";
import { ASphereCollider } from "../collider/ASphereCollider";
import { ColliderFeature } from "../collider/ColliderFeature";
import { Script } from "../Script";
import { intersectBox2Box, intersectSphere2Box, intersectSphere2Sphere } from "./intersect";

/**
 * Detect collisions between the Collider on the current entity and other Colliders in the scene.
 */
export class CollisionDetection extends Script {
  private static _tempVec3: Vector3 = new Vector3();
  private static _tempBox1: BoundingBox = new BoundingBox();
  private static _tempBox2: BoundingBox = new BoundingBox();

  private _colliderManager;
  private _myCollider;
  private _overlopCollider;
  private _sphere;
  private _box: BoundingBox = new BoundingBox();

  private _evts = Object.create(null);
  private _evtCount = 0;

  /**
   * Constructor of the colliseion detection.
   * @param entity - Entity to which the colliseion detection belong
   */
  constructor(entity) {
    super(entity);
  }

  /**
   * The collider that intersects with the collider on the current Entity.
   */
  get overlopCollider() {
    return this._overlopCollider;
  }

  /**
   * When every frame is updated, calculate the collision with other collider.
   */
  onUpdate(deltaTime) {
    super.onUpdate(deltaTime);

    let overlopCollider = null;

    if (this._colliderManager && this._myCollider) {
      const colliders = this._colliderManager.colliders;

      if (this._myCollider instanceof ABoxCollider) {
        this._updateWorldBox(this._myCollider, this._box);
        for (let i = 0, len = colliders.length; i < len; i++) {
          const collider = colliders[i];
          if (collider != this._myCollider && this._boxCollision(collider)) {
            overlopCollider = collider;
            // @ts-ignore
            this.dispatch("collision", { collider });
          }
        } // end of for
      } else if (this._myCollider instanceof ASphereCollider) {
        this._sphere = this._getWorldSphere(this._myCollider);
        for (let i = 0, len = colliders.length; i < len; i++) {
          const collider = colliders[i];
          if (collider != this._myCollider && this._sphereCollision(collider)) {
            overlopCollider = collider;
            // @ts-ignore
            this.dispatch("collision", { collider });
          }
        } // end of for
      }
    } // end of if

    //-- overlop events
    if (overlopCollider != null && this._overlopCollider != overlopCollider) {
      // @ts-ignore
      this.dispatch("begin_overlop", { collider: overlopCollider });
    }

    if (this._overlopCollider != null && this._overlopCollider != overlopCollider) {
      const e = this._overlopCollider;
      // @ts-ignore
      this.dispatch("end_overlop", { collider: e });
    }

    this._overlopCollider = overlopCollider;
  }

  /**
   * Calculate the boundingbox in world space from boxCollider.
   * @param boxCollider - The boxCollider to calculate
   * @param out - The caclulated boundingBox
   */
  _updateWorldBox(boxCollider, out: BoundingBox): void {
    const mat = boxCollider.entity.transform.worldMatrix;
    const source = CollisionDetection._tempBox1;
    boxCollider.boxMax.cloneTo(source.max);
    boxCollider.boxMin.cloneTo(source.min);
    BoundingBox.transform(source, mat, out);
  }

  /**
   * Get the sphere info of the given sphere collider in world space.
   * @param sphereCollider - The given sphere collider
   */
  _getWorldSphere(sphereCollider) {
    const center: Vector3 = new Vector3();
    Vector3.transformCoordinate(sphereCollider.center, sphereCollider.entity.transform.worldMatrix, center);
    return {
      radius: sphereCollider.radius,
      center
    };
  }

  /**
   * Collider and another collider do collision detection.
   * @param other - The another collider to collision detection
   */
  _boxCollision(other) {
    if (other instanceof ABoxCollider) {
      const box = CollisionDetection._tempBox2;
      this._updateWorldBox(other, box);
      return intersectBox2Box(box, this._box);
    } else if (other instanceof ASphereCollider) {
      const sphere = this._getWorldSphere(other);
      return intersectSphere2Box(sphere, this._box);
    }
    return false;
  }

  /**
   * Collider and another collider do collision detection.
   * @param other - The another collider to collision detection
   */
  _sphereCollision(other) {
    if (other instanceof ABoxCollider) {
      const box = CollisionDetection._tempBox2;
      this._updateWorldBox(other, box);
      return intersectSphere2Box(this._sphere, box);
    } else if (other instanceof ASphereCollider) {
      const sphere = this._getWorldSphere(other);
      return intersectSphere2Sphere(sphere, this._sphere);
    }
    return false;
  }

  onAwake() {
    this._colliderManager = this.scene.findFeature(ColliderFeature);
    this._myCollider = this.entity.getComponent(ACollider);
  }
}
applyMixins(CollisionDetection, [EventDispatcher]);
function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}

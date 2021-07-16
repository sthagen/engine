import { Color } from "@oasis-engine/math";
import { Scene } from "../Scene";
import { Shader } from "../shader";
import { ShaderMacro } from "../shader/ShaderMacro";
import { ShaderProperty } from "../shader/ShaderProperty";
import { TextureCubeMap } from "../texture";
import { DiffuseMode } from "./enums/DiffuseMode";

/**
 * Ambient light.
 */
export class AmbientLight {
  private static _diffuseMacro: ShaderMacro = Shader.getMacroByName("O3_USE_DIFFUSE_ENV");
  private static _specularMacro: ShaderMacro = Shader.getMacroByName("O3_USE_SPECULAR_ENV");

  private static _diffuseColorProperty: ShaderProperty = Shader.getPropertyByName("u_envMapLight.diffuse");
  private static _diffuseTextureProperty: ShaderProperty = Shader.getPropertyByName("u_env_diffuseSampler");
  private static _diffuseIntensityProperty: ShaderProperty = Shader.getPropertyByName("u_envMapLight.diffuseIntensity");
  private static _specularTextureProperty: ShaderProperty = Shader.getPropertyByName("u_env_specularSampler");
  private static _specularIntensityProperty: ShaderProperty = Shader.getPropertyByName(
    "u_envMapLight.specularIntensity"
  );
  private static _mipLevelProperty: ShaderProperty = Shader.getPropertyByName("u_envMapLight.mipMapLevel");

  private _scene: Scene;
  private _diffuseSolidColor: Color = new Color(0.212, 0.227, 0.259);
  private _diffuseIntensity: number = 1.0;
  private _specularReflection: TextureCubeMap;
  private _specularIntensity: number = 1.0;
  private _diffuseMode: DiffuseMode = DiffuseMode.SolidColor;

  /**
   * Diffuse mode of ambient light.
   */
  get diffuseMode(): DiffuseMode {
    return this._diffuseMode;
  }

  set diffuseMode(value: DiffuseMode) {
    this._diffuseMode = value;
    if (value === DiffuseMode.Texture) {
      this._scene.shaderData.enableMacro(AmbientLight._diffuseMacro);
    } else {
      this._scene.shaderData.disableMacro(AmbientLight._diffuseMacro);
    }
  }

  /**
   * Diffuse reflection solid color.
   * @remarks Effective when diffuse reflection mode is `DiffuseMode.SolidColor`.
   */
  get diffuseSolidColor(): Color {
    return this._diffuseSolidColor;
  }

  set diffuseSolidColor(value: Color) {
    if (value !== this._diffuseSolidColor) {
      value.cloneTo(this._diffuseSolidColor);
    }
  }

  /**
   * Diffuse reflection intensity.
   */
  get diffuseIntensity(): number {
    return this._diffuseIntensity;
  }

  set diffuseIntensity(value: number) {
    this._diffuseIntensity = value;
    this._scene.shaderData.setFloat(AmbientLight._diffuseIntensityProperty, value);
  }

  /**
   * Specular reflection texture.
   */
  get specularTexture(): TextureCubeMap {
    return this._specularReflection;
  }

  set specularTexture(value: TextureCubeMap) {
    this._specularReflection = value;

    const shaderData = this._scene.shaderData;

    if (value) {
      shaderData.setTexture(AmbientLight._specularTextureProperty, value);
      shaderData.setFloat(AmbientLight._mipLevelProperty, this._specularReflection.mipmapCount);
      shaderData.enableMacro(AmbientLight._specularMacro);
    } else {
      shaderData.disableMacro(AmbientLight._specularMacro);
    }
  }

  /**
   * Specular reflection intensity.
   */
  get specularIntensity(): number {
    return this._specularIntensity;
  }

  set specularIntensity(value: number) {
    this._specularIntensity = value;
    this._scene.shaderData.setFloat(AmbientLight._specularIntensityProperty, value);
  }

  constructor(scene: Scene) {
    this._scene = scene;

    const { shaderData } = this._scene;
    shaderData.setColor(AmbientLight._diffuseColorProperty, this._diffuseSolidColor);
    shaderData.setFloat(AmbientLight._diffuseIntensityProperty, this._diffuseIntensity);
    shaderData.setFloat(AmbientLight._specularIntensityProperty, this._specularIntensity);
  }

  //-----------------------------deprecated---------------------------------------

  private _diffuseTexture: TextureCubeMap;

  /**
   * Diffuse cube texture.
   */
  get diffuseTexture(): TextureCubeMap {
    return this._diffuseTexture;
  }

  set diffuseTexture(value: TextureCubeMap) {
    this._diffuseTexture = value;
    this._scene.shaderData.setTexture(AmbientLight._diffuseTextureProperty, value);
  }
}

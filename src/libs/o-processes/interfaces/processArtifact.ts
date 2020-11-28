import {ProcessArtifactType} from "./processArtifactType";

/**
 * Is used to describe a requested value in a 'Prompt' event and to return
 * the requested value in a 'Continue' event.
 */
export interface ProcessArtifact {
  /**
   * The property name of this artifact on the context's 'data' property.
   */
  key: string,
  /**
   * The type of the artifact.
   * Each type is associated with a corresponding UI-editor.
   */
  type: ProcessArtifactType,
  /**
   * Hidden artifacts won't be shown to the user. They can be used to configure
   * the 'banner' of a Prompt message.
   */
  isHidden?: boolean,
  /**
   * If the artifact is optional it doesn't need to be included in a 'Continue'
   * event that responds to a 'Prompt' in order to proceed to the next state.
   */
  isOptional?: boolean,
  /**
   * If users can edit the value of this artifact.
   */
  isReadonly?: boolean,
  /**
   * If set, the value is used as <label> for the rendered input.
   */
  label?: string,
  /**
   * When this object is used in a Prompt/Continue scenario,
   * this property must be set to 'true' if the 'value' of this
   * object was changed between Prompt and Continue.
   */
  changed?:boolean,
  /**
   * Either the initial, edited or no value.
   */
  value?: any
}
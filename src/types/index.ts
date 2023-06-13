import { BlockToolData } from '@editorjs/editorjs';

/**
 * expand Tool's input and output data format
 */
export interface expandData extends BlockToolData {}

/**
 * expand Tool's configuration object that passed through the initial Editor config
 */
export interface expandConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    credential: {
        [key: string] : string
    };
    model: string;
    genPrompts: (origin: string) => string
}

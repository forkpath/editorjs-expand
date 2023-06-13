'use client'
/*
 * Import EditorJS API
 */
import { API, BlockAPI, BlockTune } from '@editorjs/editorjs';
import { fetchEventSource } from '@fortaine/fetch-event-source'

/**
 * Import types and utils
 */
import { expandData, expandConfig } from './types';

/**
 * expand tune Tool for Editor.js
 */
export default class Expand implements BlockTune {
  /**
   * Code API — public methods to work with Editor
   *
   * @link https://editorjs.io/api
   */
  private readonly api: API;

  /**
   * Block API — methods and properties to work with Block instance
   *
   * @link https://editorjs.io/blockapi
   */
  private readonly block: BlockAPI;

  /**
   * Tool data for input and output
   */
  private data: expandData;

  /**
   * Configuration object that passed through the initial Editor configuration.
   */
  private readonly config: expandConfig;

  static get isTune(): boolean {
    return true
  }

  /**
   * Class constructor
   *
   * @link https://editorjs.io/tools-api#class-constructor
   */
  constructor({ data, config, api, block }: { data: expandData, config: expandConfig, api: API, block: BlockAPI }) {
    this.data = data;
    this.config = config;
    this.api = api;
    this.block = block;
  }

  render() {
    return {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
      label: 'Expand by AI',
      onActivate: async () => {
        await this.tuneClicked()
      },
      closeOnActivate: true // when u click on the button, it will close the tune menu
    }
  }

  async tuneClicked() {

    const controller = new AbortController()
    const requestTimeoutId = setTimeout(() => controller.abort(), 60000)

    let newBlock: BlockAPI | null = null;
    if (this.block.name === 'header') {
      newBlock = this.api.blocks.insert(
          'paragraph',
          {text: ''},
          {},
          this.api.blocks.getCurrentBlockIndex() + 1,
          true
      );
    }

    if (newBlock) {

      const { url, method, model, genPrompts} = this.config
      const paragraphEle = this.api.blocks.getById(newBlock!.id)?.holder.querySelector('.cdx-block')!
      const that = this
      let responseText = ''
      await fetchEventSource(url, {
        method,
        headers: {
          ...that.config.credential
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          messages: [{ 'role': 'user', 'content': genPrompts(that.block.holder.innerText)}],
          stream: true
        }),

        // sse open
        async onopen(res){
          clearTimeout(requestTimeoutId)
          const contentType = res.headers.get('content-type')

          // if contentType is not json, it means the request is not successful
          if (contentType?.startsWith('text/plain')) {
            paragraphEle.append('Can not generate content for the header now. Please try again later.')
          }
        },

        // sse message
        onmessage(msg) {
          if (msg.data === '[DONE]') {
            console.log('sse finished')
          }
          const text = msg.data
          try {
            const json = JSON.parse(text)
            const delta = json.choices[0].delta.content
            if (delta) {
              paragraphEle.append(delta)
            }
          } catch (e) {
            console.error('[Request] parse error', text, msg)
          }
        },

        // sse close
        onclose() {
          console.log('sse closed')
        },

        // sse error
        onerror(e) {
          console.log('sse error: ', e)
        },
        openWhenHidden: true
      })

      // move caret to the end of the new block
      const index = this.api.blocks.getBlockIndex(newBlock.id)
      this.api.caret.setToBlock(index, 'end');
    }
  }

  /**
   * Clear Tools stuff: cache, variables, events.
   * Called when Editor instance is destroying.
   * @link https://editorjs.io/tools-api#destroy
   *
   * @returns {void}
   */
  destroy() {

  }
};

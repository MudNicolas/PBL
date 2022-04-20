<template>
  <div class="fr-element fr-view" :style="{ 'min-height': minHeight + 'px' }">
    <froala ref="editor" v-model="content" :tag="'div'" :config="config" />
  </div>
</template>

<script>
// Require Froala Editor js file.
import 'froala-editor/js/languages/zh_cn.js'
// Require Froala Editor css files.
import 'froala-editor/css/froala_editor.pkgd.min.css'
import 'froala-editor/css/froala_style.min.css'
// import plugins
import 'froala-editor/js/plugins/video.min.js'
import 'froala-editor/js/plugins/word_paste.min.js'
import 'froala-editor/js/plugins/url.min.js'
import 'froala-editor/js/plugins/table.min.js'
import 'froala-editor/js/plugins/save.min.js'
import 'froala-editor/js/plugins/quote.min.js'
import 'froala-editor/js/plugins/paragraph_format.min.js'
import 'froala-editor/js/plugins/paragraph_style.min.js'
import 'froala-editor/js/plugins/lists.min.js'
import 'froala-editor/js/plugins/link.min.js'
import 'froala-editor/js/plugins/image.min.js'
import 'froala-editor/js/plugins/image_manager.min.js'
import 'froala-editor/js/plugins/line_height.min.js'
import 'froala-editor/js/plugins/line_breaker.min.js'
import 'froala-editor/js/plugins/help.min.js'
import 'froala-editor/js/plugins/fullscreen.min.js'
import 'froala-editor/js/plugins/font_size.min.js'
import 'froala-editor/js/plugins/entities.min.js'
import 'froala-editor/js/plugins/edit_in_popup.min.js'
import 'froala-editor/js/plugins/draggable.min.js'
import 'froala-editor/js/plugins/colors.min.js'
import 'froala-editor/js/plugins/char_counter.min.js'
import 'froala-editor/js/plugins/align.min.js'
import 'froala-editor/js/plugins/inline_class.min.js'
import 'froala-editor/js/plugins/inline_style.min.js'

import { getToken } from '@/utils/auth'
import { autosave } from '@/api/editor'

export default {
    name: 'Editor',
    props: {
        existContent: {
            type: String,
            default: ''
        },
        minHeight: {
            type: Number,
            default: 300
        },
        autosavePosition: Object,
        autosavePath: {
            type: String,
            default: ''
        },
        imageUploadPath: String,
        videoUploadPath: String
    },

    // TODO
    /**
     * √图片视频的上传，
     * √stage记录所有上传过的image和video，
     * √保存对比没用到的，标记isused为false，
     * 显示在管理员清理文件的七天外文件中
     */
    data() {
        const handleInit = editor => {
            this.handleInit(editor)
        }

        const imageUploadPath = this.imageUploadPath
        const videoUploadPath = this.videoUploadPath

        return {
            editor: null,
            config: {
                events: {
                    initialized: function() {
                        handleInit(this)
                    },

                    'image.error': (error, response) => {
                        this.$message.error(error.message)
                        if (response) {
                            this.$message.error(JSON.parse(response).message)
                        }
                    },

                    'save.before': html => {
                        this.autosave(html)
                        return false
                    }
                },
                requestHeaders: {
                    token: getToken()
                },
                imageUploadParam: 'img',
                imageUploadURL: imageUploadPath,

                // 自动保存(s)
                saveInterval: 1000 * 10,

                heightMin: this.minHeight,
                toolbarStickyOffset: 50,
                language: 'zh_cn', // 中文
                charCounterCount: true,
                imageAllowedTypes: [
                    'jpeg',
                    'jpg',
                    'png',
                    'gif',
                    'webp',
                    'png;base64',
                    'svg+xml',
                    'bmp'
                ],
                linkAlwaysBlank: true,
                imagePasteProcess: true,

                // 500MB
                videoMaxSize: 1024 * 1024 * 500,
                videoUploadParam: 'video',
                videoUploadURL: videoUploadPath,

                quickInsertEnabled: false,
                fontSizeDefaultSelection: '18',
                toolbarButtons: {
                    moreText: {
                        buttons: [
                            'bold',
                            'italic',
                            'underline',
                            'strikeThrough',
                            'subscript',
                            'superscript',
                            'fontSize',
                            'textColor',
                            'backgroundColor',
                            'inlineClass',
                            'inlineStyle',
                            'clearFormatting'
                        ]
                    },
                    moreParagraph: {
                        buttons: [
                            'alignLeft',
                            'alignCenter',
                            'formatOLSimple',
                            'alignRight',
                            'alignJustify',
                            'formatOL',
                            'formatUL',
                            'paragraphFormat',
                            'paragraphStyle',
                            'lineHeight',
                            'outdent',
                            'indent',
                            'quote'
                        ]
                    },
                    moreRich: {
                        buttons: [
                            'insertTable',
                            'insertImage',
                            'insertVideo',
                            'insertLink',
                            'insertHR'
                        ]
                    },
                    moreMisc: {
                        buttons: ['undo', 'redo', 'fullscreen', 'selectAll', 'help'],
                        align: 'right',
                        buttonsVisible: 2
                    }
                }
            },
            content: this.existContent
        }
    },
    methods: {
        autosave(content) {
            // 防止保存空值
            const path = this.autosavePath
            if (content && path) {
                const position = this.autosavePosition

                autosave(path, { ...position, content })
                    .then()
                    .catch(err => {
                        console.log(err)
                    })
            }
        },
        handleInit(editor) {
            this.editor = editor
        }
    }
}
</script>

<style lang='scss'>
#fr-logo {
    position: absolute;
    top: -99999999px;
    opacity: 0;
}

a[href="https://froala.com/wysiwyg-editor"], a[href="https://www.froala.com/wysiwyg-editor?k=u"]
{
    position: absolute;
    top: -99999999px;
    opacity: 0;
}
</style>

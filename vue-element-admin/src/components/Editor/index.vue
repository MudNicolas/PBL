<template>
    <div>
        <froala :tag="'div'" :config="config" v-model="content" ref="editor"></froala>
        <div class="view-wrapper">
            <div class="fr-box fr-basic">
                <div class="fr-element">
                    <froalaView v-model="content"></froalaView>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// Require Froala Editor js file.
import "froala-editor/js/froala_editor.pkgd.min.js"
import "froala-editor/js/languages/zh_cn.js"
// Require Froala Editor css files.
import "froala-editor/css/froala_editor.pkgd.min.css"
import "froala-editor/css/froala_style.min.css"
//import plugins
import "froala-editor/js/plugins/video.min.js"
import "froala-editor/js/plugins/word_paste.min.js"
import "froala-editor/js/plugins/url.min.js"
import "froala-editor/js/plugins/table.min.js"
import "froala-editor/js/plugins/save.min.js"
import "froala-editor/js/plugins/quote.min.js"
import "froala-editor/js/plugins/paragraph_format.min.js"
import "froala-editor/js/plugins/paragraph_style.min.js"
import "froala-editor/js/plugins/lists.min.js"
import "froala-editor/js/plugins/link.min.js"
import "froala-editor/js/plugins/image.min.js"
import "froala-editor/js/plugins/image_manager.min.js"
import "froala-editor/js/plugins/line_height.min.js"
import "froala-editor/js/plugins/line_breaker.min.js"
import "froala-editor/js/plugins/help.min.js"
import "froala-editor/js/plugins/fullscreen.min.js"
import "froala-editor/js/plugins/font_size.min.js"
import "froala-editor/js/plugins/entities.min.js"
import "froala-editor/js/plugins/edit_in_popup.min.js"
import "froala-editor/js/plugins/draggable.min.js"
import "froala-editor/js/plugins/colors.min.js"
import "froala-editor/js/plugins/code_view.min.js"
import "froala-editor/js/plugins/code_beautifier.min.js"
import "froala-editor/js/plugins/char_counter.min.js"
import "froala-editor/js/plugins/align.min.js"

import { getToken } from "@/utils/auth"
import { autosave } from "@/api/timeline-project"

export default {
    name: "Editor",
    props: {
        existContent: {
            type: String,
            default: "",
        },
        minHeight: {
            type: Number,
            default: 300,
        },
        stageId: String,
    },
    methods: {
        autosave(content) {
            let stageID = this.stageId

            autosave({ stageID, content }).then().catch()
        },
        handleInit(editor) {
            this.editor = editor
        },
    },

    //TODO: 图片视频的上传，stage记录所有上传过的image和video，保存对比没用到的，标记isused为false，显示在管理员清理文件的七天外文件中
    data() {
        let handleInit = editor => {
            this.handleInit(editor)
        }

        let stageID = this.stageId
        let imageUploadPath
        let videoUploadPath
        if (stageID) {
            imageUploadPath =
                process.env.VUE_APP_BASE_API +
                "/activity/view/timeline/stage/editor/image/upload?stageID=" +
                stageID
            videoUploadPath =
                process.env.VUE_APP_BASE_API +
                "/activity/view/timeline/stage/editor/video/upload?stageID=" +
                stageID
        }

        return {
            editor: null,
            config: {
                events: {
                    initialized: function () {
                        handleInit(this)
                    },

                    "image.error": (error, response) => {
                        this.$message.error(error.message)
                        if (response) {
                            this.$message.error(JSON.parse(response).message)
                        }
                    },

                    "save.before": html => {
                        this.autosave(html)
                        return false
                    },
                },
                requestHeaders: {
                    token: getToken(),
                },
                imageUploadParam: "img",
                imageUploadURL: imageUploadPath,

                //自动保存
                saveInterval: 1000 * 30,

                heightMin: this.minHeight,
                toolbarStickyOffset: 50,
                language: "zh_cn", //中文
                charCounterCount: true,
                imageAllowedTypes: [
                    "jpeg",
                    "jpg",
                    "png",
                    "gif",
                    "webp",
                    "png;base64",
                    "svg+xml",
                    "bmp",
                ],
                linkAlwaysBlank: true,
                imagePasteProcess: true,

                //500MB
                videoMaxSize: 1024 * 1024 * 500,
                videoUploadParam: "video",
                videoUploadURL: videoUploadPath,

                quickInsertEnabled: false,
                fontSizeDefaultSelection: "18",
                toolbarButtons: {
                    moreText: {
                        buttons: [
                            "bold",
                            "italic",
                            "underline",
                            "strikeThrough",
                            "subscript",
                            "superscript",
                            "fontFamily",
                            "fontSize",
                            "textColor",
                            "backgroundColor",
                            "inlineClass",
                            "inlineStyle",
                            "clearFormatting",
                        ],
                    },
                    moreParagraph: {
                        buttons: [
                            "alignLeft",
                            "alignCenter",
                            "formatOLSimple",

                            "alignRight",
                            "alignJustify",
                            "formatOL",
                            "formatUL",
                            "paragraphFormat",
                            "paragraphStyle",
                            "lineHeight",
                            "outdent",
                            "indent",
                            "quote",
                        ],
                    },
                    moreRich: {
                        buttons: [
                            "insertLink",
                            "insertImage",
                            "insertVideo",
                            "insertTable",
                            "emoticons",
                            "fontAwesome",
                            "specialCharacters",
                            "embedly",
                            "insertFile",
                            "insertHR",
                        ],
                        buttonsVisible: 5,
                    },
                    moreMisc: {
                        buttons: [
                            "undo",
                            "redo",
                            "fullscreen",
                            "print",
                            "getPDF",
                            "spellChecker",
                            "selectAll",
                            "html",
                            "help",
                        ],
                        align: "right",
                        buttonsVisible: 2,
                    },
                },
            },
            content: this.existContent,
        }
    },
}
</script>

<style lang='scss'>
#fr-logo {
    display: none;
}
.view-wrapper {
    border: 1px solid #cccccc;
    border-radius: 10px;
}
</style>

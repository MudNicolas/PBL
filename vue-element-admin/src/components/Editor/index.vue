<template>
    <div>
        <froala :tag="'div'" :config="config" v-model="content"></froala>
        <froalaView v-model="content"></froalaView>
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
import "froala-editor/js/plugins/track_changes.min.js"

import { getToken } from "@/utils/auth"

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
        saveUrl: String,
        stageId: String,
    },
    methods: {
        handleErrorMessage(m) {
            this.$message.error(m)
        },
    },
    //TODO: 图片视频的上传，stage记录所有上传过的image和video，保存对比没用到的，标记isused为false，显示在管理员清理文件的七天外文件中
    data() {
        let handleErrorMessage = message => {
            this.handleErrorMessage(message)
        }

        let stageID = this.stageId
        let path
        if (stageID) {
            path =
                process.env.VUE_APP_BASE_API +
                "/activity/view/timeline/stage/editor/image/upload?stageID=" +
                stageID
        }
        return {
            imagesID: [],
            config: {
                events: {
                    "froalaEditor.initialized": function () {
                        console.log("initialized")
                    },

                    "image.error": function (error, response) {
                        handleErrorMessage(error.message)
                        if (response) {
                            handleErrorMessage(JSON.parse(response).message)
                        }
                    },

                    "image.uploaded": function (response) {},

                    "image.removed": function ($img) {
                        // Do something here.
                        // this is the editor instance.
                        console.log($img)
                    },
                },
                requestHeaders: {
                    token: getToken(),
                },
                imageUploadParam: "img",
                imageUploadURL: path,

                heightMin: this.minHeight,
                language: "zh_cn", //中文
                charCounterCount: true,
                imageAllowedTypes: ["jpeg", "jpg", "png", "gif", "webp", "png;base64"],
                linkAlwaysBlank: true,
                imagePasteProcess: true,

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
                            "trackChanges",
                        ],
                        buttonsVisible: 6,
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

<style>
</style>

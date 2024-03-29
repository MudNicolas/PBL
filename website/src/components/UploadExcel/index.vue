<template>
    <div>
        <input
            ref="excel-upload-input"
            class="excel-upload-input"
            type="file"
            accept=".xlsx, .xls"
            @change="handleClick"
        />
        <div
            @click="handleUpload"
            class="drop"
            @drop="handleDrop"
            @dragover="handleDragover"
            @dragenter="handleDragover"
        >
            {{ infoText }}

            点击浏览文件
        </div>
        <div class="info">
            注意，请按照模板上传数据，
            <el-button type="text" @click="getTemplate">点击下载模板</el-button>
        </div>
    </div>
</template>

<script>
import XLSX from "xlsx"

export default {
    props: {
        beforeUpload: Function, // eslint-disable-line
        onSuccess: Function, // eslint-disable-line
        infoText: String,
        tHeader: {
            type: Array,
            default: () => [],
        },
        filterVal: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            loading: false,
            excelData: {
                header: null,
                results: null,
            },
            filename: "template",
            list: [{ id: "", name: "" }],
        }
    },
    methods: {
        generateData({ header, results }) {
            this.excelData.header = header
            this.excelData.results = results
            this.onSuccess && this.onSuccess(this.excelData)
        },
        handleDrop(e) {
            e.stopPropagation()
            e.preventDefault()
            if (this.loading) return
            const files = e.dataTransfer.files
            if (files.length !== 1) {
                this.$message.error("请导入一个excel文件")
                return
            }
            const rawFile = files[0] // only use files[0]

            if (!this.isExcel(rawFile)) {
                this.$message.error("支持 .xlsx, .xls, .csv 格式的文件")
                return false
            }
            this.upload(rawFile)
            e.stopPropagation()
            e.preventDefault()
        },
        handleDragover(e) {
            e.stopPropagation()
            e.preventDefault()
            e.dataTransfer.dropEffect = "copy"
        },
        handleUpload() {
            this.$refs["excel-upload-input"].click()
        },
        handleClick(e) {
            const files = e.target.files
            const rawFile = files[0] // only use files[0]
            if (!rawFile) return
            this.upload(rawFile)
        },
        upload(rawFile) {
            this.$refs["excel-upload-input"].value = null // fix can't select the same excel

            if (!this.beforeUpload) {
                this.readerData(rawFile)
                return
            }
            const before = this.beforeUpload(rawFile)
            if (before) {
                this.readerData(rawFile)
            }
        },
        readerData(rawFile) {
            this.loading = true
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = e => {
                    const data = e.target.result
                    const workbook = XLSX.read(data, { type: "array" })
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]
                    const header = this.getHeaderRow(worksheet)
                    const results = XLSX.utils.sheet_to_json(worksheet)
                    this.generateData({ header, results })
                    this.loading = false
                    resolve()
                }
                reader.readAsArrayBuffer(rawFile)
            })
        },
        getHeaderRow(sheet) {
            const headers = []
            const range = XLSX.utils.decode_range(sheet["!ref"])
            let C
            const R = range.s.r
            /* start in the first row */
            for (C = range.s.c; C <= range.e.c; ++C) {
                /* walk every column in the range */
                const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
                /* find the cell in the first row */
                let hdr = "UNKNOWN " + C // <-- replace with your desired default
                if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
                headers.push(hdr)
            }
            return headers
        },
        isExcel(file) {
            return /\.(xlsx|xls|csv)$/.test(file.name)
        },
        getTemplate() {
            this.downloadLoading = true
            import("@/vendor/Export2Excel").then(excel => {
                const tHeader = this.tHeader
                const filterVal = this.filterVal
                const list = this.list
                const data = this.formatJson(filterVal, list)
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: this.filename,
                })
                this.downloadLoading = false
            })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v =>
                filterVal.map(j => {
                    if (j === "timestamp") {
                        return parseTime(v[j])
                    } else {
                        return v[j]
                    }
                })
            )
        },
    },
}
</script>

<style scoped>
.excel-upload-input {
    display: none;
    z-index: -9999;
}
.drop {
    border: 2px dashed #bbb;
    min-width: 600px;
    height: 160px;
    line-height: 160px;
    margin: 0 auto;
    font-size: 24px;
    border-radius: 5px;
    text-align: center;
    color: #bbb;
    position: relative;
    cursor: pointer;
}
.info {
    margin-top: 16px;
    text-align: center;
    color: #aaa;
    font-size: 14px;
}
</style>

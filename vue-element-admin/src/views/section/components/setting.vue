<template>
    <div>
        <el-tabs :tab-position="'left'" type="border-card">
            <el-tab-pane label="内容管理" lazy v-loading="loading">
                <content-manage :section-id="sectionId" :table-data="tableData" />
            </el-tab-pane>

            <el-tab-pane label="信息查询与导出" lazy></el-tab-pane>

            <el-tab-pane label="基本信息设置" lazy>基本信息设置</el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import ContentManage from "./comtentManage"
import { getSectionView } from "@/api/section"

export default {
    name: "SectionSetting",
    components: { ContentManage },
    props: ["sectionId"],
    data() {
        return {
            tableData: [],
            sectionID: this.sectionId,
            section: {
                name: "",
                info: "",
            },
            loading: true,
        }
    },
    created() {
        this.getSectionView()
    },
    methods: {
        getSectionView() {
            this.loading = true
            getSectionView({ sectionID: this.sectionID })
                .then(res => {
                    this.tableData = res.data.content
                    this.section.name = res.data.name
                    this.section.info = res.data.info

                    this.loading = false
                })
                .catch()
        },
        openLink(url) {
            console.log(url)
            window.open(url)
        },
        download(_id) {
            download(_id)
        },
    },
}
</script>

<style lang='scss' >
.container {
    padding: 20px;
}
</style>

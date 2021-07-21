<template>
    <div>
        <el-tabs :tab-position="'left'" type="border-card">
            <el-tab-pane label="基础内容管理" lazy>
                <content-manage :section-id="sectionId" />
            </el-tab-pane>

            <el-tab-pane label="信息查询与导出" lazy></el-tab-pane>

            <el-tab-pane label="基本信息设置" lazy>基本信息设置</el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import ContentManage from "./comtentManage/content"

export default {
    name: "SectionSetting",
    components: { ContentManage },
    props: ["sectionId"],
    data() {
        return {
            sectionID: this.sectionId,
        }
    },
}
</script>

<style lang='scss' >
.container {
    padding: 20px;
}
</style>

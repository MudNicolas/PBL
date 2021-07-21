<template>
    <div v-loading="loading" class="container">
        <div class="header">
            <div class="title">{{ section.name }}</div>
            <div class="info">{{ section.info | noInfo }}</div>
        </div>
        <section-content-list :table-data="tableData"></section-content-list>
    </div>
</template>

<script>
import SectionContentList from "./components/contentList.vue"
import { getSectionView } from "@/api/section"

export default {
    name: "SectionContentView",
    props: ["sectionId"],
    components: { SectionContentList },
    filters: {
        noInfo: function (val) {
            if (!val) {
                return "暂无简介"
            }
            return val
        },
    },
    data() {
        return {
            tableData: [],
            sectionID: this.sectionId,
            section: {
                name: "",
                info: "",
            },
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
    },
}
</script>
<style lang="scss" scoped>
.container {
    padding: 30px;
    color: #606266;

    .header {
        .title {
            font-size: 20px;
            margin-bottom: 10px;
            line-height: 1.7;
        }
        .info {
            font-size: 14px;
            margin-bottom: 30px;
        }
    }
}
</style>



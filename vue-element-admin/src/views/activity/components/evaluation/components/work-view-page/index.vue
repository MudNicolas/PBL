<template>
    <div class="container" v-loading="loading" element-loading-text="加载中">
        <el-form><work-view :work="work" /></el-form>
    </div>
</template>

<script>
import workView from "../work-view"
import { getWork } from "@/api/evaluation"
export default {
    name: "ViewEvaluation",
    components: { workView },
    data() {
        return {
            workID: "",
            loading: false,
            work: {},
            dimensions: [],
        }
    },
    created() {
        this.workID = this.$route.params["id"]
        this.getWork()
    },
    methods: {
        getWork() {
            this.loading = true
            let { workID } = this
            getWork({ workID })
                .then(res => {
                    let { work, dimensions } = res.data
                    this.work = work
                    this.dimensions = dimensions
                    this.loading = false
                })
                .catch(err => {
                    console.log(err)
                })
        },
    },
}
</script>

<style lang="scss" scoped>
.container {
    min-height: 80vh;
    padding: 40px;
}
</style>


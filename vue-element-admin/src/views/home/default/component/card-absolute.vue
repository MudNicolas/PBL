<template>
    <el-card
        :body-style="{
            padding: '0px',
        }"
        ref="liftcard"
        class="lift-card"
        :class="{
            'card-scale': isActive,
        }"
    >
        <router-link :to="'/course/view/' + course._id">
            <div class="block">
                <el-image :src="path + course.cover" fit="fill"
                    ><div slot="placeholder" class="image-slot">
                        加载中<span class="dot">...</span>
                    </div>
                </el-image>
            </div>
        </router-link>

        <div style="padding: 14px; cursor: pointer" @click="onActive">
            <span style="float: right; margin: 0 8px"
                ><i
                    class="el-icon-arrow-down intro-arrow"
                    :class="{
                        'intro-arrow-rotate': isActive,
                    }"
            /></span>
            <span>{{ course.name }} </span>
            <div class="bottom clearfix">
                <div class="teacher">
                    <span>
                        {{ course.chiefTeacher.name }}
                    </span>
                    <span
                        v-for="teacher in course.partnerTeacher"
                        :key="course._id + teacher.name"
                    >
                        {{ teacher.name }}
                    </span>
                </div>
            </div>
        </div>
        <div ref="intro" class="intro">
            <div style="padding: 0 14px 14px 14px">
                {{ course.introduction }}
            </div>
        </div>
    </el-card>
</template>

<script>
export default {
    name: "card-absolute",
    props: ["course", "clickedItemID"],
    data() {
        return {
            isActive: false,
            path:
                process.env.VUE_APP_PUBLIC_PATH +
                process.env.VUE_APP_COVER_PATH,
        };
    },
    watch: {
        //监听点击的卡片，若点击的卡片不是本card，则收回卡片
        clickedItemID: {
            handler(item) {
                if (item !== this.course._id) {
                    this.isActive = false;
                    this.$refs.intro.style.height = "0px";
                }
            },
        },
    },
    methods: {
        //点击卡片伸缩，同时传给其他卡片本卡片的id，让他们回收，始终最多只会有一个card展开
        onActive() {
            //console.log(this.clickedItemID, "+", this.course._id);
            this.$emit("update:clickedItemID", this.course._id);
            this.isActive = !this.isActive;
            if (this.isActive) {
                this.$refs.intro.style.height =
                    this.$refs.intro.scrollHeight + "px";
            } else {
                this.$refs.intro.style.height = "0px";
            }
        },
    },
};
</script>

<style scoped>
.block {
    display: flex;
    background: #f5f7fa;
    justify-content: center;
    align-items: center;
    color: #c0c4cc;
    font-size: 14px;
}
.block::after {
    content: "";
    padding-top: 60%;
}
.teacher {
    font-size: 14px;
    color: #999;
    margin-top: 6px;
}
.intro {
    word-wrap: break-word;
    height: 0px;
    width: 100%;
    overflow: hidden;
    width: 100%;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    background-color: #fff;
    color: #8e8e8e;
    font-size: 13px;
}
.lift-card {
    transition: all 0.4s;
    position: absolute;
    width: 100%;
    top: 0px;
    bottom: 0px;
    height: fit-content;
    z-index: 0;
}
.card-scale {
    transform: scale(1.0681818182);
    z-index: 9999;
}

.intro-arrow {
    transition: all 0.4s;
}
.intro-arrow-rotate {
    transform: rotate(180deg);
}
</style>

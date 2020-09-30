node('mobile-build-slave') {
    try {
        String ANSI_GREEN = "\u001B[32m"
        String ANSI_NORMAL = "\u001B[0m"
        String ANSI_BOLD = "\u001B[1m"
        String ANSI_RED = "\u001B[31m"
        String ANSI_YELLOW = "\u001B[33m"

        ansiColor('xterm') {
            stage('Checkout') {
                cleanWs()
                checkout scm
            }

            stage('Build') {
                sh """
                    cp /opt/jenkins/build.json $WORKSPACE/build.json
                    cp /opt/jenkins/diksha.jks $WORKSPACE/diksha.jks
                    cp /opt/jenkins/appConfig.ts $WORKSPACE/src/providers/appConfig.ts
                    export ANDROID_HOME=/home/ops/android-sdk-linux
                    export PATH=/home/ops/android-sdk-linux:/home/ops/android-sdk-linux/platform-tools:$PATH
                    export PATH=$PATH:/usr/lib/gradle/4.7/bin
                    gradle -v
                    echo \$ANDROID_HOME
                    echo \$PATH
                    echo \$BUILD_NUMBER
                    rm -f  $JENKINS_HOME/.gradle/caches/modules-2/modules-2.lock
                    rm -f  $JENKINS_HOME/.gradle/caches/transforms-1/transforms-1.lock
                    rm -rf $JENKINS_HOME/.gradle/caches/*/fileHashes/
                    rm -rf \$HOME/.gradle/caches/*/plugin-resolution/
                    ./build.sh
                """

            }
            stage('ArchiveArtifacts') {
                archiveArtifacts "platforms/android/app/build/outputs/apk/**/*/diksha-*.apk"
                currentBuild.description = "Built from ${branch_or_tag}"
            }
        }

    }
    catch (err) {
        currentBuild.result = "FAILURE"
        throw err
    }
}

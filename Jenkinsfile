def IMAGE_VERSION
pipeline {
	agent any
	stages {
        stage("Checkout") {
            steps {
                checkout scm
            }
        }
        stage('Docker Build') {
            agent any
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'nexus-credential', 
                        usernameVariable: 'NEXUS_USER', 
                        passwordVariable: 'NEXUS_PASS')]) {
                        IMAGE_VERSION = sh(
                            script: '''
                            curl -s -u "$NEXUS_USER:$NEXUS_PASS" ${env.NEXUS_URL}/v2/app/tags/list \\
                            | jq -r '.tags[]' | sort -Vr | head -n 1
                            ''',
                            returnStdout: true
                        ).trim()

                        
                        def CLEAN = IMAGE_VERSION.replace("v", "")
                        def parts = CLEAN.tokenize('.')
                        def MAJOR = parts[0] as int
                        def MINOR = parts[1] as int
                        def PATCH = parts[2] as int

                        def NEW_PATCH = PATCH + 1
                        def NEW_IMAGE_VERSION = "v${MAJOR}.${MINOR}.${NEW_PATCH}"
                    }
                    echo "${env.IMAGE_REPO}:${NEW_IMAGE_VERSION}"
                    app = docker.build("${env.IMAGE_REPO}")
                }
            }
        }
        stage('Push Image') {
            agent any
            steps {
                script {
                    docker.withRegistry("https://${env.IMAGE_REPO}", "nexus-credential") {            
                        app.push(NEW_IMAGE_VERSION)
                        app.push("latest")
                    }
                }
            }
        }
    }
}

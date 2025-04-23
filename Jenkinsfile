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
                        def NEXUS_URL = env.NEXUS_URL

                        def CURL_RESULT = sh(
                            script: "curl -s -u ${NEXUS_USER}:${NEXUS_PASS} ${NEXUS_URL}/v2/app/tags/list",
                            returnStdout: true
                        )
                        echo "${CURL_RESULT}"

                        def IMAGE_VERSION = sh(
                            script: "echo '${CURL_RESULT}' | jq -r .tags[] | sort -Vr | head -n 1",
                            returnStdout: true
                        )
                        echo "${IMAGE_VERSION}"

                        
                        def CLEAN = IMAGE_VERSION.replace("v", "")
                        def parts = CLEAN.tokenize('.')
                        def MAJOR = parts[0] as int
                        def MINOR = parts[1] as int
                        def PATCH = parts[2] as int

                        def NEW_PATCH = PATCH + 1
                        NEW_IMAGE_VERSION = "v${MAJOR}.${MINOR}.${NEW_PATCH}"
                        echo "${NEW_IMAGE_VERSION}"
                    }
                    echo "${env.IMAGE_REPO}:${NEW_IMAGE_VERSION}"
                    app = docker.build("${env.IMAGE_REPO}:${NEW_IMAGE_VERSION}")
                }
            }
        }
        stage('Push Image') {
            agent any
            steps {
                script {
                    docker.withRegistry("https://${env.IMAGE_REPO}", "nexus-credential") {            
                        app.push("${NEW_IMAGE_VERSION}")
                        app.push("latest")
                    }
                }
            }
        }
        stage('Image Update') {
            agent any
            steps {
                script {
                    withCredentials([gitUsernamePassword(credentialsId: 'github-credential')]) {
                        sh "rm -rf *"
                        sh "rm -rf .git"
                        sh "git clone git@github.com:seunghyun-you/on-premise-cicd-manifest.git"
                        sh "git config --global user.email 'jenkins@example.com'"
                        sh "git config --global user.name 'Jenkins CI'"

                        sh "sed -i 's/tag: \"v[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+\"/tag: \"${NEW_IMAGE_VERSION}\"/g' values.yaml"
                        
                        sh "git add values.yaml"
                        sh "git commit -m 'Update image tag to ${NEW_IMAGE_VERSION}'"
                        sh "git push origin main"
                    }
                }
            }
        }
    }
}
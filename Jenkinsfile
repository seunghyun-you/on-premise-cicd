pipeline {
	agent any
    environment {
        IMAGE_VERSION = ''
        NEW_IMAGE_VERSION = ''
    }

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
                            script: "curl -s ${NEXUS_URL}/v2/app/tags/list",
                            returnStdout: true
                        )
                        echo "${CURL_RESULT}"


                        env.IMAGE_VERSION = sh(
                            script: "curl -s ${NEXUS_URL}/v2/app/tags/list | jq -r .tags[] | sort -Vr | head -n 1",
                            returnStdout: true
                        ).trim()
                        echo "${env.IMAGE_VERSION}"

                        
                        def CLEAN = env.IMAGE_VERSION.replace("v", "")
                        def parts = CLEAN.tokenize('.')
                        def MAJOR = parts[0] as int
                        def MINOR = parts[1] as int
                        def PATCH = parts[2] as int

                        def NEW_PATCH = PATCH + 1
                        env.NEW_IMAGE_VERSION = "v${MAJOR}.${MINOR}.${NEW_PATCH}"
                        echo "${env.NEW_IMAGE_VERSION}"
                    }
                    echo "${env.IMAGE_REPO}:${env.NEW_IMAGE_VERSION}"
                    app = docker.build("${env.IMAGE_REPO}:${env.NEW_IMAGE_VERSION}")
                }
            }
        }
        stage('Push Image') {
            agent any
            steps {
                script {
                    docker.withRegistry("https://${env.IMAGE_REPO}", "nexus-credential") {            
                        app.push("${env.NEW_IMAGE_VERSION}")
                        app.push("latest")
                    }
                }
            }
        }
    }
}
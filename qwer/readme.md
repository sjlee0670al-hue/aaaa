margin, padding

GitHub

\document.getElementById()

border-radius: 50%

슬라이더

GitHub는 전 세계 개발자들이 모여 협업하고 실력을 겨루는 ‘강호(江湖)’와 같은 공간으로, 코드 관리, 버전 관리, 협업, 과제 제출 등을 효율적으로 수행할 수 있기 때문에 중요합니다.
GitHub Pages를 이용해 웹 페이지를 배포하는 과정은 다음과 같습니다:
GitHub에 저장소(repository)를 생성한다.
저장소에 HTML, CSS, JavaScript 등 웹 페이지 파일을 업로드한다.
저장소의 Settings 탭으로 이동한다.
Pages 섹션에서 배포할 브랜치(예: main)와 폴더(예: /root)를 선택한다.
저장하면 제공된 URL을 통해 웹 페이지가 인터넷에 배포된다.

margin은 요소의 바깥 여백을 설정하며, 요소와 요소 사이의 간격을 조절할 때 사용합니다. padding은 요소의 안쪽 여백을 설정하며, 요소 내부 콘텐츠와 테두리 사이의 간격을 조절할 때 사용합니다.

1단계: input[name="fruit"]
→ name 속성이 "fruit"인 input 요소들(라디오 버튼들)을 선택합니다. 이 name 속성은 라디오 버튼들을 그룹으로 묶어줍니다.
2단계: :checked
→ 이 선택자 :checked는 그룹 중 사용자가 실제로 선택한(체크된) 라디오 버튼 하나만을 선택합니다.
3단계: document.querySelector(...)
→ CSS 선택자 전체 'input[name="fruit"]:checked'를 기준으로 문서에서 첫 번째로 일치하는 요소 하나만 선택합니다. 라디오 버튼은 한 그룹에서 오직 하나만 선택될 수 있기 때문에, 이 선택자는 정확히 선택된 라디오 버튼 하나만 가져오게 됩니다.
4단계: .value
→ 선택된 input 요소의 value 속성 값을 읽어옵니다. 이 값이 바로 사용자가 선택한 과일(또는 항목)의 값입니다.

value

style, head

HTML에서 버튼과 텍스트 입력창, 결과를 표시할 요소에 각각 id를 부여한다.
JavaScript에서 document.getElementById()를 사용하여 버튼, 입력창, 결과 표시 요소를 선택한다.
버튼에 addEventListener('click', function() {...})를 사용하여 클릭 이벤트를 등록한다.
클릭 이벤트 함수 안에서 입력창의 값을 .value로 가져온다.
가져온 값을 결과 표시 요소의 .textContent에 할당하여 화면에 출력한다.

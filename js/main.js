$(function() {

    $('#gallery').each(function() {

        var $container = $(this),
            $loadMoreButton = $('#load-more'),
            $filter = $('#gallery-filter'), //form id="gallery-filter"
            addItemCount = 10, //一次顯示10張圖
            allData = [], //全部有幾張照片
            filteredData = [], //過濾後的資料
            added = 0;

        $container.masonry({
            columnWidth: 230,
            gutter: 10, //間隙
            itemSelector: '.gallery-item' //每一張圖片掛上去的class是gallery-item
        });

        //應該要通過json格式的file 
        $.getJSON('./data/content.json', initGallery); //讀JSON檔轉成物件data丟到initGallery

        function initGallery(data) {

            //把getJASON的資料存在變數allData中
            allData = data;
            //預設不篩選資料
            filteredData = allData;

            //把要顯示的圖片加入Gallery
            addItems();

            //當按了more button就加入新的項目
            $loadMoreButton.on('click', addItems);

            //當篩選的選項改變的時候，就要去過濾要顯示的項目
            $filter.on('change', 'input[type="radio"]', filterItems);
        }

        function addItems(filter) {
            var elements = [],
                //從added的地方，到added + addItemCount(10)的圖片它存起來
                //因為一次只能顯示addItemCount個圖片
                slicedData = filteredData.slice(added, added + addItemCount); 

            $.each(slicedData, function(i, item) { //jQuery的迴圈寫法
                var itemHTML =
                    '<li class="gallery-item is-loading">' +
                    '<a href="' + item.images.large + '">' +
                    '<img src="' + item.images.thumb + '" alt="">' +
                    '<span class="caption">' +
                    '<span class="inner">' +
                    '<b class="title">' + item.title + '</b>' +
                    '</span>' +
                    '</span>' +
                    '</a>' +
                    '</li>';
                elements.push($(itemHTML).get(0));
            });

            $container.append(elements).imagesLoaded(function() {
                $(elements).removeClass('is-loading'); //讀取完把is-loading拿掉
                $container.masonry('appended', elements);
                if (filter) {
                    $container.masonry();
                }
            }); //加.imagesLoaded外掛
            $container.find('a').colorbox({
                maxWidth: '970px', //燈箱的最大寬度
                maxHeight: '95%', //燈箱的最大高度
                title: function() { //燈箱的title
                    return $(this).find('.inner').html();
                }
            }); //加入colorbox燈箱效果外掛

            added += slicedData.length;
            if (added < filteredData.length)
                $loadMoreButton.show();
            else
                $loadMoreButton.hide();
        }

        function filterItems() {
            var key = $(this).val(), //這個$(this)是被你選到的radio的值可能是all,people etc
                masonryItems = $container.masonry('getItemElements');

            $container.masonry('remove', masonryItems); //要刪的圖

            filteredData = [];
            added = 0;
            if (key === 'all') {
                filteredData = allData;
            } else {
                filteredData = $.grep(allData, function(item) {
                    return item.category === key;
                });
            }

            addItems(true);
        }

    });

    $('.filter-form input[type="radio"]').button({
        icons: {
            primary: 'icon-radio'
        }
    }); //改radio樣式

    $('.page-header').each(function() {
        var $header = $(this),
            headerHeight = $header.outerHeight(),
            headerPaddingTop = parseInt($header.css('paddingTop'), 10),
            headerPaddingBottom = parseInt($header.css('paddingBottom'), 10);

        $(window).on('scroll', $.throttle(1000 / 60, function() {
            var scrollTop = $(this).scrollTop(),
                styles = {};

            if (scrollTop > 0) { //往下捲的時候你要改的樣式
                if (scrollTop < headerHeight) {
                    styles = {
                        paddingTop: headerPaddingTop - scrollTop / 2,
                        paddingBottom: headerPaddingBottom - scrollTop / 2
                    };
                } else { //沒有捲的時候
                    styles = {
                        paddingTop: 0,
                        paddingBottom: 0
                    };
                }
            } else {
                styles = {
                    paddingTop: '',
                    paddingBottom: ''
                };
            }
            $header.css(styles);
        })); //不要頻率很高的一直偵測scroll bar捲動

    }); //捲動的時候縮放上方導覽列:1.偵測捲軸捲到哪裏 2.縮小放大


});

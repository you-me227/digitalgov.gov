jQuery(document).ready(function(i){i(".edit_tools .edit-open").click(function(t){t.preventDefault(),i(".edit_tools").is(".active")?(i("*[data-edit-this]").each(function(){i(this).removeClass("edit-this"),i(".edit_this_btn").remove()}),i(".edit_tools").removeClass("active"),i(this).html('<i class="far fa-edit"></i>')):(i("*[data-edit-this]").each(function(){var t='<a class="edit_this_btn" href="https://workflow.digital.gov'+i(this).data("edit-this")+'" title="edit this" target="_blank"><span>edit</span></a>';i(this).addClass("edit-this").append(t)}),i(".edit_tools").addClass("active"),i(this).html('<i class="fas fa-times"></i>'))})});
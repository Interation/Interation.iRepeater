using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Interation.iRepeater.Web.ViewModel
{
    public class FeaturedViewModel
    {
        public List<TopicViewModel> Topics { get; set; }
        public List<ProductViewModel> Newest { get; set; }
        public List<ProductViewModel> Hottest { get; set; }
    }
}

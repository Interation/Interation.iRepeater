using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Interation.iRepeater.Repository.Entity;
using Interation.iRepeater.Service.Contract;

namespace Interation.iRepeater.Repository.Entity
{
    public static class TopicExtension
    {
        public static TopicContract ToContractModel(this Topic entity)
        {
            return new TopicContract
            {
                Id = entity.Id,
                Name = entity.Name,
                ImageUrl = entity.ImageUrl,
                CreatedDate = entity.CreatedDate
            };
        }
    }
}
